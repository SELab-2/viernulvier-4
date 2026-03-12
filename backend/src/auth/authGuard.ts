import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { ApiKeyDatabaseService } from "../database/db.apiKey.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly api: ApiKeyDatabaseService) {}

  /**
   * Verifies that the user can execute a certain function (guard)
   * @param context is the context in which this function was called.
   * @returns T/F depending on if the user is allowed to execute or not.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    // Look for x-api-key header
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      throw new UnauthorizedException("Missing API key");
    }

    return await this.api.verifyApiKey({ key: apiKey });
  }
}

// same as above but use this one for superuser endpoints such as accounts and/or apiKeys!
@Injectable()
export class SuperApiKeyGuard implements CanActivate {
  constructor(private readonly api: ApiKeyDatabaseService) {}

  /**
   * Verifies that the user can execute a certain function (guard)
   * @param context is the context in which this function was called.
   * @returns T/F depending on if the user is allowed to execute or not.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    // Look for x-api-key header
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      throw new UnauthorizedException("Missing API key");
    }

    return await this.api.verifySuperApiKey({ key: apiKey });
  }
}
