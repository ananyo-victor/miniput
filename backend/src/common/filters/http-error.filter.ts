import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if ((exception as any)?.type === 'entity.too.large') {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        success: false,
        error: 'Payload too large. Please upload a smaller image.',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json(exceptionResponse);
    }

    const message = (exception as any)?.message || 'Internal Server Error';
    console.error('[Error Filter]:', message);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: message,
    });
  }
}
