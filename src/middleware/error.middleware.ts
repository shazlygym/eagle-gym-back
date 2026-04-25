import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 'Validation error', 422, err.errors);
    return;
  }

  // Prisma errors
  const prismaError = err as { code?: string; meta?: { target?: string[] } };
  if (prismaError.code === 'P2002') {
    const field = prismaError.meta?.target?.[0] || 'field';
    sendError(res, `${field} already exists`, 409);
    return;
  }
  if (prismaError.code === 'P2025') {
    sendError(res, 'Record not found', 404);
    return;
  }

  sendError(res, 'Internal server error', 500);
};
