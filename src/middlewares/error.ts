import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { ValidationError } from 'yup';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleError(err: Error, req: Request, res: Response, next: NextFunction) {
  const { status = 500, path } = err as ValidationError & HttpError;
  const message = status !== 500 ? err.message : 'Internal Server Error';
  if (status === 500) console.log(err);
  res.status(status).json({ message, path });
}
