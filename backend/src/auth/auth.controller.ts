import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiKeyDto,
  CreateAccountDto,
  PublicAccountDto,
  UpdateAccountDto,
} from "../dto/dto";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { SuperApiKeyGuard } from "./authGuard";
import { ZodValidationPipe } from "nestjs-zod";
import { CreateAccountSchema, UpdateAccountSchema } from "@repo/common";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public method that allows anyone to try to log in.
   * The only endpoint not protected in this file.
   * @param account The Account the user wants to log into.
   * @returns The Account and their ApiKey.
   */
  @ApiOperation({ summary: "Logs into an existing account." })
  @UsePipes(new ZodValidationPipe(CreateAccountSchema))
  @Post("login")
  async loginAccount(
    @Body() account: CreateAccountDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    return await this.authService.loginAccount(account);
  }

  /**
   * Responds to GET to "/auth".
   * @returns A list of all existing Account objects.
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Returns a list of Accounts." })
  @ApiOkResponse({
    type: PublicAccountDto,
    isArray: true,
    description: "Accounts found.",
  })
  @Get()
  async getAccounts(): Promise<PublicAccountDto[]> {
    return await this.authService.getAccounts();
  }

  /**
   * Responds to POST to "/auth".
   * @param createAccount The Account we want to create.
   * @returns The newly created account.
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Account." })
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({
    type: PublicAccountDto,
    description: "New Account created.",
  })
  @UsePipes(new ZodValidationPipe(CreateAccountSchema))
  @Post()
  async createAccount(
    @Body() createAccount: CreateAccountDto,
  ): Promise<PublicAccountDto> {
    return await this.authService.createAccount(createAccount);
  }

  /**
   * Responds to PATCH to "/auth".
   * @param updateAccount The Accounts we want to update.
   * @returns The Updated account.
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing account." })
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({
    type: PublicAccountDto,
    description: "Updated Account successfully.",
  })
  @UsePipes(new ZodValidationPipe(UpdateAccountSchema))
  @Patch()
  async updateAccount(
    @Body() updateAccount: UpdateAccountDto,
  ): Promise<PublicAccountDto> {
    return await this.authService.updateAccount(updateAccount);
  }

  /**
   * Responds to a DELETE to "/auth/:accountId"
   * @param accountId The ID of the account we want to delete.
   * @returns Whether the Account was deleted successfully.
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing account." })
  @ApiOkResponse({ description: "Account deleted." })
  @Delete(":accountId")
  async deleteAccount(
    @Param("accountId", ParseIntPipe) accountId: number,
  ): Promise<boolean> {
    return await this.authService.deleteAccount(accountId);
  }
}
