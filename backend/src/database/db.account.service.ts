import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import {
  AccountDto,
  ApiKeyDto,
  CreateAccountDto,
  PublicAccountDto,
  UpdateAccountDto,
} from "../dto/dto";
import * as bcrypt from "bcryptjs"; // note all function should require guarding(except login) and all POST,DELETE,... super_guard
import { PaginatedResponse } from "@repo/common";

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
      SELECT id, username, super_admin
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
   * @returns T/F if the account was creates successfully.
   */
  async createAccount(account: CreateAccountDto): Promise<PublicAccountDto> {
    const hashedPassword = await bcrypt.hash(account.password, 10); // salt rounds = 10

    const query = `
      INSERT INTO accounts (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `;

    const result = await this.db.query<PublicAccountDto>(query, [
      account.username,
      hashedPassword,
    ]);

    // note that we do not return the account, simply if it was successful.
    return result[0];
  }

  /**
   * Login to your account.
   * @param account is the account params you need to log in (username, passw).
   * @returns your account and apiKey if login was successful
   */
  async loginAccount(
    account: CreateAccountDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    // 1. Fetch account by username
    const query = `
      SELECT id, username, password, super_admin
      FROM accounts
      WHERE username = $1
      LIMIT 1
    `;

    // Returning AccountDto should be safe here since we never show this to the user.s
    const result = await this.db.query<AccountDto>(query, [account.username]);

    if (result.length === 0) {
      throw new BadRequestException("Invalid username.");
    }

    const dbAccount: AccountDto = result[0];

    // 2. Verify password using bcrypt
    const isValid = await bcrypt.compare(account.password, dbAccount.password);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    // 3. Fetch the active API key for this account
    const apiKey = await this.getApiKeyFromAccount({
      id: dbAccount.id,
      username: dbAccount.username,
    });

    // 4. Return safe account info + apiKey
    const publicAccount: PublicAccountDto = {
      id: dbAccount.id,
      username: dbAccount.username,
    };

    return { account: publicAccount, apiKey };
  }

  /**
   * Updates an account information.
   * @param account is of the type UpdateAccount and needs at least its id defined.
   * @returns the updated account information.
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
      RETURNING id, username, super_admin
    `;

    const result = await this.db.query<PublicAccountDto>(query, values);

    if (result.length === 0) {
      throw new Error("Account not found");
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
   */
  async linkAccountToKey(account_id: number, api_id: number): Promise<void> {
    const query = `INSERT INTO account_api_keys (account_id, api_key_id) VALUES ($1, $2)`;
    await this.db.query<PublicAccountDto>(query, [account_id, api_id]);
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

    return result[0] ?? null;
  }
}
