import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import { ZodType } from "zod";

/**
 * Add this pipe to any request body that requires you to parse a Zod Schema into an object.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  /**
   * Validates any Zod Schema used in the method body of a Controller.
   * For defined Schemas see `root/common`.
   * @param value The schema we are trying to parse into an object.
   * @param metadata Metadata attached to the value.
   * @returns The parsed object, or throws a BadRequestException if unable to parse.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch {
      throw new BadRequestException("Schema Validation Failed");
    }
  }
}
