import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;

        if (Array.isArray(resp.message)) {
          code = 'VALIDATION_ERROR';
          details = resp.message;
          message = 'Validation failed';
          status = HttpStatus.BAD_REQUEST;
        } else {
          message = resp.message || exception.message;
          code = resp.error || HttpStatus[status];
        }
      } else {
        message = exceptionResponse as string;
        code = HttpStatus[status];
      }
    } else if (exception instanceof QueryFailedError) {
      const pgError = exception as any;
      if (pgError.code === '23505') {
        status = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        message = 'Resource already exists';
      } else {
        this.logger.error(`Database error: ${(exception as Error).message}`);
      }
    } else {
      this.logger.error(`Unhandled exception: ${exception}`);
    }

    response.status(status).json({
      success: false,
      error: { code, message, ...(details && { details }) },
    });
  }
}
