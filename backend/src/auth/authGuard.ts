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
