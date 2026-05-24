import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import pool from '../../config/database.config';

@Injectable()
export class AuthService {
  async validateAdminCredentials(
    username: string,
    password: string,
  ) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM users
      WHERE LOWER(username) = LOWER($1)
      AND is_active = true
      LIMIT 1
      `,
      [username.trim()],
    );

    if (!rows.length) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const user = rows[0];

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password_hash,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    await pool.query(
      `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = $1
      `,
      [user.id],
    );

    return user;
  }

  generateAccessToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
      },
    );
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET!,
      ) as any;
    } catch {
      return null;
    }
  }

  async getUserById(id: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] || null;
  }
}