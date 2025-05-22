import { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequest } from 'http-errors';
import { isNil, map, omitBy } from 'lodash';
import { Schema, ValidationError } from 'yup';

export type SchemaMap = { [key: string]: Schema };
export function validate(
  bodySchema: Schema | null,
  additionalSchemas: SchemaMap = {},
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    // concat params and protect from possible null schema
    const validationSchemas = omitBy(
      {
        ...additionalSchemas,
        body: bodySchema,
      },
      isNil,
    ) as SchemaMap;

    const validationErrors: ValidationError[] = [];

    const promises = map(validationSchemas, async (schema, path) => {
      req[`casted_${path}`] = await schema
        .validate(req[path], { stripUnknown: true })
        .catch((err: ValidationError) => {
          validationErrors.push(err);
          return req[path];
        });
    });

    await Promise.all(promises);

    if (!validationErrors.length) {
      return next();
    }

    const { message, path } = validationErrors[0];
    const error = new BadRequest(message);
    error.path = path;
    return next(error);
  };
}
