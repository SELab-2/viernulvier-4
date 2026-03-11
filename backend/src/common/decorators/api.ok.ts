import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

/**
 * Custom decorator for arrays of joint types.
 * @param models The Array types of the models we want to use.
 * @returns The Decorator.
 */
export function ApiOkArrayAnyOf(...models: Type<any>[]) {
  return applyDecorators(
    ApiExtraModels(...models),
    ApiOkResponse({
      description: "Successfully returned array of objects.",
      schema: {
        anyOf: models.map((model) => ({
          type: "array",
          items: { $ref: getSchemaPath(model) },
        })),
      },
    }),
  );
}

/**
 * Custom decorator for base types of joint types.
 * @param models The base types of the models we want to use.
 * @returns The Decorator.
 */
export function ApiOkAnyOf(...models: Type<any>[]) {
  return applyDecorators(
    ApiExtraModels(...models),
    ApiOkResponse({
      description: "Successfully returned objects.",
      schema: {
        anyOf: models.map((model) => ({
          $ref: getSchemaPath(model),
        })),
      },
    }),
  );
}
