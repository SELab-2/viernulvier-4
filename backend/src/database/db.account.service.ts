import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { AccountDto, CreateAccountDto, UpdateAccountDto } from "../dto/dto";

@Injectable()
export class AccountDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}

  /**
   * Get a single Account by their ID.
   * @param id The ID we are looking for.
   * @returns The account if there is one.
   */
  async getAccountByID(id: number): Promise<AccountDto> {
    const query = `SELECT * FROM accounts WHERE id = $1`;

    const result = await this.db.query<AccountDto>(query, [id]);

    if (result.length === 0) {
      throw new Error("Tag not found");
    }
    return result[0];
  }

  /**
   * Get accounts with optional pagination.
   * @param amount number of accounts per page (0 = return all)
   * @param page page index (starts at 0)
   * @returns accounts
   */
  async getAccounts(amount: number, page: number = 0): Promise<AccountDto[]> {
    // No pagination → return all accounts
    if (amount === 0) {
      const query = `
      SELECT *
      FROM accounts
      ORDER BY id
    `;

      return this.db.query<AccountDto>(query);
    }

    // Pagination
    const offset = amount * page;

    const query = `
    SELECT *
    FROM accounts
    ORDER BY id
    LIMIT $1 OFFSET $2
  `;

    return this.db.query<AccountDto>(query, [amount, offset]);
  }

  /**
   * Create account function, creates an account in the database.
   * @param account must be of the type "CreateAccount" which has all fields defined besides the primary key id.
   * @returns the added account if it was successful.
   */
  async createTag(account: CreateAccountDto): Promise<AccountDto> {
    if (!account.username || !account.password) {
      throw new BadRequestException("Missing required fields");
    }

    // TODO when finish db tables
  }

  /**
   * Update function for accounts. Updates the account in the database.
   * @param account must be of the type "UpdateTag", gives the freedom to define only what needs to be updated.
   * The id field in the account MUST be defined.
   * @returns the updated account if successful.
   */
  async updateAccounts(account: UpdateAccountDto): Promise<AccountDto> {
    if (!account) {
      throw new Error("Account not found");
    }

    // TODO when db scheme is defined.
  }

  /**
   * Delete function for deleting accounts from the database.
   * @param id must be a valid id in the database. If an invalid id is given, then nothing happens and no errors are thrown.
   * (silent handling)
   * @returns nothing.
   */
  async deleteAccount(id: number): Promise<void> {
    const query = `DELETE FROM accounts WHERE id = $1`;

    await this.db.query(query, [id]);
  }
}
