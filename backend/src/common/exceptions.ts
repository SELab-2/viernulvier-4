import {
  HttpException,
  HttpStatus,
  NotFoundException,
  Type,
} from "@nestjs/common";
import { GalleryType } from "@repo/common";

// 418 I'm a teapot easter egg
export class TeapotException extends HttpException {
  constructor() {
    super("I'm a teapot", HttpStatus.I_AM_A_TEAPOT);
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
