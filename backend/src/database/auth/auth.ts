import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();

    // Look for x-api-key header
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      throw new UnauthorizedException("Missing API key");
    }

    // Replace with your own validation logic
    const validKeys = ["abc", "def"]; // Example: allow multiple keys
    if (!validKeys.includes(apiKey)) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true; // allow access
  }
}
