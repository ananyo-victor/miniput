import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(@Body() body: any) {
    try {
      const { userId, password } = body;
      const isValid = this.authService.verifyAdminCredentials(userId, password);

      if (isValid) {
        const accessToken = this.authService.generateAccessToken(userId);
        const refreshToken = this.authService.generateRefreshToken(userId);

        return {
          success: true,
          message: 'Admin authenticated',
          accessToken,
          refreshToken,
        };
      }

      throw new UnauthorizedException({ success: false, message: 'Invalid credentials' });
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  @Post('admin/refresh')
  @HttpCode(HttpStatus.OK)
  refreshAdminToken(@Body() body: any) {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        throw new UnauthorizedException({ success: false, message: 'Refresh token required' });
      }

      const decoded = this.authService.verifyRefreshToken(refreshToken);

      if (!decoded) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      const newAccessToken = this.authService.generateAccessToken(decoded.id);
      const newRefreshToken = this.authService.generateRefreshToken(decoded.id);

      return {
        success: true,
        message: 'Token refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Token refresh failed',
        error: error.message,
      });
    }
  }
}
