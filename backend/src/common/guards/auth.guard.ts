import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authorization token is required',
      });
    }

    try {
      request.user = jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      if ((error as any).name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          success: false,
          message: 'Token has expired',
        });
      }

      throw new UnauthorizedException({
        success: false,
        message: 'Invalid token',
      });
    }
  }
}
