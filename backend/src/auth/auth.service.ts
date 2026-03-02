import { BadRequestException, Injectable } from "@nestjs/common";
import { AccountDatabaseService } from "../database/db.account.service";
import { ApiKeyDatabaseService } from "../database/db.apiKey.service";
import { ApiKeyDto, CreateAccountDto, PublicAccountDto } from "../dto/dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly accountDbService: AccountDatabaseService,
    private readonly apiKeyDbService: ApiKeyDatabaseService,
  ) {}

  async loginAccount(
    account: CreateAccountDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    return await this.accountDbService.loginAccount(account);
  }

  async createAccount(account: CreateAccountDto): Promise<boolean> {
    const valid: boolean = await this.accountDbService.createAccount(account);
    if (!valid) throw new Error("Could not create account.");

    const accounts: PublicAccountDto = await this.accountDbService.get()
    const apiKey: ApiKeyDto = await this.apiKeyDbService.generateApiKey();
    await this.accountDbService.linkAccountToKey()
  }
}
