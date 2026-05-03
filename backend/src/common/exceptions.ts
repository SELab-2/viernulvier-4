import {
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Type,
  UnauthorizedException,
} from "@nestjs/common";
import { GalleryType } from "@repo/common";

/**
 * This file contains some specific specialized Exceptions that are thrown
 * from withing the backend if something goes wrong.
 */

/**
 * 401 Unauthorized for failed authentication attempts.
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: "Unauthorized",
      message: "Invalid username or password",
      internalCode: "INVALID_CREDENTIALS",
    });
  }
}

/**
 * 404 not found specific for Resources.
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(dtoClass: Type<any>, resourceId?: number | string) {
    // Extract the class name.
    const resourceName = dtoClass.name.replace("Dto", "");

    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: "Not Found",
      message: `${resourceName}(${resourceId}) is currently unavailable or deleted.`,
      internalCode: "RESOURCE_NOT_FOUND",
    });
  }
}

/**
 * 404 Not Found specifically for links between two objects.
 */
export class LinkNotFoundException extends NotFoundException {
  constructor(
    dtoClass1: Type<any>,
    dtoClass2: Type<any>,
    resourceId1?: number | string,
  ) {
    // Extract the class name.
    const resourceName1 = dtoClass1.name.replace("Dto", "");
    const resourceName2 = dtoClass2.name.replace("Dto", "");

    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: "Not Found",
      message: `
        ${resourceName1}(${resourceId1}) has no links with ${resourceName2}() objects.
      `,
      internalCode: "LINK_NOT_FOUND",
    });
  }
}

/**
 * 404 Not Found specifically for objects that don't have media attached.
 */
export class MediaNotFoundException extends NotFoundException {
  constructor(
    dtoClass: Type<any>,
    galleryType: GalleryType,
    resourceId?: number | string,
  ) {
    // Extract the class name.
    const resourceName = dtoClass.name.replace("Dto", "");

    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: "Not Found",
      message: `${resourceName}(${resourceId}) currently has no Gallery of type "${galleryType}".`,
      internalCode: "GALLERY_NOT_FOUND",
    });
  }
}

/**
 * 404 Not Found specifically for foreign key violations.
 */
export class InvalidReferenceException extends NotFoundException {
  constructor() {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: "Not Found",
      message: "The provided account or API key does not exist.",
      internalCode: "REFERENCE_NOT_FOUND",
    });
  }
}

/**
 * 409 Conflict specifically for duplicate entities.
 */
export class AccountAlreadyExistsException extends ConflictException {
  constructor(username: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      error: "Conflict",
      message: `Account with username "${username}" already exists.`,
      internalCode: "ACCOUNT_ALREADY_EXISTS",
    });
  }
}

/**
 * I'm a teapot easter-egg error. :-)
 */
export class TeapotException extends HttpException {
  constructor() {
    super("I'm a teapot", HttpStatus.I_AM_A_TEAPOT);
  }
}

/**
 * 500 Internal Server Error for unexpected/unhandled issues.
 */
export class SystemFailureException extends InternalServerErrorException {
  constructor(message?: string) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      // Always provide a safe default message so you never leak stack traces
      message:
        message || "An unexpected error occurred. Please try again later.",
      internalCode: "INTERNAL_SYSTEM_ERROR",
    });
  }
}
