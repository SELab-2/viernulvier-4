import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException("Missing Authorization header");
    }

    // Basic auth header looks like: "Basic base64(username:password)"
    const [type, credentials] = authHeader.split(" ");

    if (type !== "Basic" || !credentials) {
      throw new UnauthorizedException("Invalid Authorization header");
    }

    const decoded = Buffer.from(credentials, "base64").toString("utf8");
    const [username, password] = decoded.split(":");

    // Replace with your own validation logic
    if (username !== "admin" || password !== "secret") {
      throw new UnauthorizedException("Invalid credentials");
    }

    return true; // allow access
  }
}
