import { Injectable } from "@nestjs/common";
import { AccountDatabaseService } from "../database/db.account.service";
import { ApiKeyDatabaseService } from "../database/db.apiKey.service";
import {
  ApiKeyDto,
  ChangePasswordDto,
  CreateAccountDto,
  LoginDto,
  PaginationFilterDto,
  PublicAccountDto,
  UpdateAccountDto,
} from "../dto/dto";
import { PaginatedResponse } from "@repo/common";
import { UnauthorizedException } from "@nestjs/common";
import { InvalidCredentialsException } from "../common/exceptions";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly accountDbService: AccountDatabaseService,
    private readonly apiKeyDbService: ApiKeyDatabaseService,
  ) {}

  /**
   * Returns a list of all Accounts in the Database.
   * @param paginationFilter is the pagination params
   * @returns A list of all Accounts.
   */
  async getAccounts(
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedResponse<PublicAccountDto>> {
    return await this.accountDbService.getAccounts(
      paginationFilter.limit,
      paginationFilter.page,
    );
  }

  /**
   * Logs an existing Account in.
   * @param account The Account the user is trying to log into.
   * @returns An object containing the Account and ApiKey.
   */
  async loginAccount(
    account: LoginDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    return await this.accountDbService.loginAccount(account);
  }

  /**
   * Create a new account in the Database and link a new ApiKey to it.
   * @param createAccount The account we want to create.
   * @returns The newly created Account.
   */
  async createAccount(
    createAccount: CreateAccountDto,
  ): Promise<PublicAccountDto> {
    const account: PublicAccountDto =
      await this.accountDbService.createAccount(createAccount);

    const apiKey: ApiKeyDto = await this.apiKeyDbService.generateApiKey(
      createAccount.superAdmin,
    );
    await this.accountDbService.linkAccountToKey(account.id, apiKey.id);

    return account;
  }

  /**
   * Updates an existing Account.
   * @param updateAccount The Account with it's new info we want to update.
   * @returns The Updated account.
   */
  async updateAccount(
    updateAccount: UpdateAccountDto,
  ): Promise<PublicAccountDto> {
    return await this.accountDbService.updateAccount(updateAccount);
  }

  /**
   * Deletes an existing account from the Database.
   * @param accountId The ID of the account we want to delete.
   * @returns T/F whether the account was deleted or not.
   */
  async deleteAccount(accountId: number): Promise<boolean> {
    return await this.accountDbService.deleteAccount(accountId);
  }

  /**
   * Changes the password of the account associated with the provided API key.
   * @param apiKey The API key of the account.
   * @param changePassword The new password.
   * @returns The updated account.
   */
  async changePassword(
    apiKey: string,
    changePassword: ChangePasswordDto,
  ): Promise<PublicAccountDto> {
    const account = await this.accountDbService.getAccountIdFromApiKey(apiKey);

    // Verify whether there's actually an account.
    if (!account) {
      throw new UnauthorizedException("Invalid API key.");
    }

    // Verify password using bcrypt (check whether the old password is correct)
    const isValid = await bcrypt.compare(
      account.password,
      changePassword.oldPassword,
    );
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    // Update with the new password.
    return await this.accountDbService.updateAccount({
      id: account.id,
      password: changePassword.password,
    });
  }
}
