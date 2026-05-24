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

import { AdminLoginDto } from './dto/admin-login.dto';
import { RefreshAdminTokenDto } from './dto/refresh-admin-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() body: AdminLoginDto) {
    try {
      const { username, password } =
        body;

      const user = await this.authService.validateAdminCredentials(username, password);

      const accessToken =
        this.authService.generateAccessToken(
          user,
        );

      const refreshToken =
        this.authService.generateRefreshToken(
          user,
        );

      return {
        success: true,
        message: 'Admin authenticated',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          activeWorkspaceId: user.activeWorkspaceId,
        },
      };
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        {
          success: false,
          message: 'Login failed',
          error: error.message,
        },
      );
    }
  }

  @Post('admin/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAdminToken(
    @Body()
    body: RefreshAdminTokenDto,
  ) {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        throw new UnauthorizedException(
          {
            success: false,
            message:
              'Refresh token required',
          },
        );
      }

      const decoded =
        this.authService.verifyRefreshToken(
          refreshToken,
        );

      if (!decoded) {
        throw new UnauthorizedException(
          {
            success: false,
            message:
              'Invalid or expired refresh token',
          },
        );
      }

      const user =
        await this.authService.getUserById(
          decoded.id,
        );

      if (!user || !user.is_active) {
        throw new UnauthorizedException(
          {
            success: false,
            message:
              'User no longer exists',
          },
        );
      }

      const newAccessToken =
        this.authService.generateAccessToken(
          user,
        );

      const newRefreshToken =
        this.authService.generateRefreshToken(
          user,
        );

      return {
        success: true,
        message: 'Token refreshed',

        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,

        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          activeWorkspaceId:
            user.activeWorkspaceId,
        },
      };
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        {
          success: false,
          message:
            'Token refresh failed',
          error: error.message,
        },
      );
    }
  }
}