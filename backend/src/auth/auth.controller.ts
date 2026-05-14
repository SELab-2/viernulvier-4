import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiKeyDto,
  CreateAccountDto,
  LoginDto,
  PaginationFilterDto,
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
import { ApiKeyGuard, SuperApiKeyGuard } from "./authGuard";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateAccountSchema,
  LoginSchema,
  PaginatedResponse,
  PaginationFilterSchema,
  UpdateAccountSchema,
} from "@repo/common";
import { ApiOkPaginatedResponseAnyOf } from "../common/decorators/api.ok";

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
  @UsePipes(new ZodValidationPipe(LoginSchema))
  @Post("login")
  async loginAccount(
    @Body() account: LoginDto,
  ): Promise<{ account: PublicAccountDto; apiKey: ApiKeyDto | null }> {
    return await this.authService.loginAccount(account);
  }

  /**
   * Responds to GET to "/auth".
   * @param paginationFilter is the pagination params.
   * @returns A list of all existing Account objects.
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Returns a list of Accounts." })
  @ApiOkPaginatedResponseAnyOf(PublicAccountDto)
  @Get()
  async getAccounts(
    @Query(new ZodValidationPipe(PaginationFilterSchema))
    paginationFilter: PaginationFilterDto,
  ): Promise<PaginatedResponse<PublicAccountDto>> {
    return await this.authService.getAccounts(paginationFilter);
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

  /**
   * Responds to a GET to "/auth/verify"
   * @returns true if a valid standard key was provided
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Verifies that a standard key is valid" })
  @ApiOkResponse({ description: "Key valid" })
  @Get("verify")
  verifyKey(): { valid: boolean } {
    // If the request makes it past the ApiKeyGuard, the key is strictly valid.
    return { valid: true };
  }

  /**
   * Responds to a GET to "/auth/verify-super"
   * @returns true if a super api key was provided
   */
  @UseGuards(SuperApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Verifies that a super admin key is valid" })
  @ApiOkResponse({ description: "Super key valid" })
  @Get("verify-super")
  verifySuperKey(): { valid: boolean } {
    // If the request makes it past the SuperApiKeyGuard, the key is strictly valid
    // and has super privileges.
    return { valid: true };
  }
}
