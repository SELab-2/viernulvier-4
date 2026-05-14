import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  AccountDto,
  ApiKeyDto,
  CreateAccountDto,
  LoginDto,
  PublicAccountDto,
  UpdateAccountDto,
} from "../dto/dto";
import * as bcrypt from "bcryptjs"; // note all function should require guarding(except login) and all POST,DELETE,... super_guard
import { PaginatedResponse } from "@repo/common";
import {
  AccountAlreadyExistsException,
  InvalidCredentialsException,
  InvalidReferenceException,
  SystemFailureException,
} from "../common/exceptions";
import { PostgresError } from "./db-utils";

// note all function should require guarding(except login) and all POST,DELETE,... super_guard
@Injectable()
export class AccountDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Returns all accounts in the database
   * @param amount is the amount you want
   * @param page is the page (offset) you want
   * @returns accounts.
   */
  async getAccounts(
    amount: number = 0,
    page: number = 0,
  ): Promise<PaginatedResponse<PublicAccountDto>> {
    let query = `
      SELECT id, username, super_admin AS "superAdmin"
      FROM accounts
      ORDER BY id
    `;

    const params: any[] = [];

    if (amount > 0) {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(amount, page * amount);
    }

    const [accounts, countResult] = await Promise.all([
      this.db.query<PublicAccountDto>(query, params),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM accounts`,
      ),
    ]);

    return {
      page,
      limit: amount,
      totalItems: parseInt(countResult[0].count),
      objects: accounts,
    };
  }

  /**
   * Creates an account in the database
   * @param account is of the type CreateAccount and has password and username defined.
   * @returns The created public account data.
   * @throws AccountAlreadyExistsException if the username is taken.
   * @throws SystemFailureException if something else goes wrong.
   */
  async createAccount(account: CreateAccountDto): Promise<PublicAccountDto> {
    const hashedPassword = await bcrypt.hash(account.password, 10);

    const query = `
      INSERT INTO accounts (username, password, super_admin)
      VALUES ($1, $2, $3)
      RETURNING id, username, super_admin AS "superAdmin"
    `;

    try {
      const result = await this.db.query<PublicAccountDto>(query, [
        account.username,
        hashedPassword,
        account.superAdmin,
      ]);

      return result[0];
    } catch (error: unknown) {
      const dbError = error as PostgresError;

      // catch error code 23505 from psql which is conflict on entry.
      if (dbError?.code === "23505") {
        throw new AccountAlreadyExistsException(account.username);
      }
      throw SystemFailureException;
    }
  }

  /**
   * Login to your account.
   * @param account is the account params you need to log in (username, passw).
   * @returns your account and apiKey if login was successful
   * @throws BadRequestException if an invalid username is provided (400)
   * @throws InvalidCredentialsException if an incorrect password is provided (401)
   */
  async loginAccount(
    account: LoginDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    // 1. Fetch account by username
    const query = `
      SELECT id, username, password, super_admin AS "superAdmin"
      FROM accounts
      WHERE username = $1
      LIMIT 1
    `;

    const result = await this.db.query<AccountDto>(query, [account.username]);

    if (result.length === 0) {
      throw new BadRequestException("Invalid username.");
    }

    const dbAccount: AccountDto = result[0];

    // 2. Verify password using bcrypt
    const isValid = await bcrypt.compare(account.password, dbAccount.password);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    // 3. Fetch the active API key for this account
    const apiKey = await this.getApiKeyFromAccount({
      id: dbAccount.id,
      username: dbAccount.username,
      superAdmin: dbAccount.superAdmin,
    });

    // 4. Return safe account info + apiKey
    const publicAccount: PublicAccountDto = {
      id: dbAccount.id,
      username: dbAccount.username,
      superAdmin: dbAccount.superAdmin,
    };

    return { account: publicAccount, apiKey };
  }

  /**
   * Updates an account information.
   * @param account is of the type UpdateAccount and needs at least its id defined.
   * @returns the updated account information.
   * @throws BadRequestException if the account is not found or id = null is provided.
   */
  async updateAccount(account: UpdateAccountDto): Promise<PublicAccountDto> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Update username if provided
    if (account.username) {
      updates.push(`username = $${idx++}`);
      values.push(account.username);
    }

    // Update password if provided (hash it first)
    if (account.password) {
      const hashedPassword = await bcrypt.hash(account.password, 10);
      updates.push(`password = $${idx++}`);
      values.push(hashedPassword);
    }

    // Update super_admin if provided
    if (account.superAdmin !== undefined) {
      updates.push(`super_admin = $${idx++}`);
      values.push(account.superAdmin);
    }

    if (updates.length === 0) {
      throw new Error("Nothing to update");
    }

    if (account.id === null) {
      throw new BadRequestException("invalid id");
    }

    // Add account ID at the end
    values.push(account.id);

    const query = `
      UPDATE accounts
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING id, username, super_admin AS "superAdmin"
    `;

    const result = await this.db.query<PublicAccountDto>(query, values);

    if (result.length === 0) {
      throw new BadRequestException("Account not found");
    }

    return result[0]; // safe account info
  }

  /**
   * Deletes an account out of the database
   * @param id is the id of the account you want to delete
   * @returns T/F is the account was deleted.
   */
  async deleteAccount(id: number): Promise<boolean> {
    const query = `DELETE FROM accounts WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);

    return result.length > 0;
  }

  /**
   * Link an account to an apiKey
   * @param account_id is the id of the account
   * @param api_id is the id of the api_key
   * @returns nothing. (silent handling)
   * @throws InvalidReferenceException if you try to link with an id that does not exist
   * @throws SystemFailureException if something generic goes wrong.
   */
  async linkAccountToKey(account_id: number, api_id: number): Promise<void> {
    const query = `INSERT INTO account_api_keys (account_id, api_key_id) VALUES ($1, $2)`;

    try {
      await this.db.query(query, [account_id, api_id]);
    } catch (error: unknown) {
      const dbError = error as PostgresError;

      // Catch error code 23503 from psql: foreign_key_violation
      if (dbError?.code === "23503") {
        throw new InvalidReferenceException();
      }

      throw SystemFailureException;
    }
  }

  /**
   * Get an apiKey of an account
   * @param account is the account you want the apiKey of.
   * @returns the apiKey.
   */
  async getApiKeyFromAccount(
    account: PublicAccountDto,
  ): Promise<ApiKeyDto | null> {
    const query = `
      SELECT api_keys.id, api_keys.key
      FROM api_keys
      JOIN account_api_keys aak ON aak.api_key_id = api_keys.id
      WHERE aak.account_id = $1
        AND api_keys.active = TRUE
      LIMIT 1
    `;

    const result = await this.db.query<ApiKeyDto>(query, [account.id]);

    return result[0] ?? null; // should never happen that an account does not have an api-key!
    // however don't throw an error for security reasons.
  }
}
