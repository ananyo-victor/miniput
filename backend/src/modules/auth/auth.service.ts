import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import pool from '../../config/database.config';
import { WhatsappClientService } from '../whatsapp/whatsapp-client.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly whatsappClient: WhatsappClientService,
    private readonly usersService: UsersService
  ) { }

  private isLocalEnv(): boolean {
    const env = (process.env.IS_LOCAL || '').trim().toLowerCase();
    return env === 'true' || env === '1';
  }

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
        expiresIn: '12h',
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

  async sendCustomerOtp(phone: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await pool.query(
      `INSERT INTO otp_verifications (phone, otp, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
       ON CONFLICT (phone) DO UPDATE SET otp = $2, expires_at = NOW() + INTERVAL '5 minutes', created_at = NOW()`,
      [phone, otp],
    );

    const message = `Your Miniput login OTP is ${otp}. It is valid for 5 minutes.`;

    if (this.isLocalEnv()) {
      console.log(`[LOCAL DEV] WhatsApp bypassed. OTP for ${phone} is: ${otp} (You can also use 1111)`);
    } else {
      await this.whatsappClient.sendTemplate(phone, 'customer_otp', 'en', [otp], [{ index: 0, text: otp }]);
    }

    const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);

    return { success: true, exists: rows.length > 0 };
  }

  async verifyCustomerOtp(phone: string, otp: string) {
    const isLocalBypass = this.isLocalEnv() && otp === '1111';

    if (!isLocalBypass) {
      const { rows } = await pool.query(
        `SELECT otp FROM otp_verifications WHERE phone = $1 AND expires_at > NOW()`,
        [phone],
      );

      if (!rows.length || rows[0].otp !== otp) {
        throw new BadRequestException('Invalid or expired OTP');
      }
    }

    await pool.query(`DELETE FROM otp_verifications WHERE phone = $1 OR expires_at <= NOW()`, [phone]);

    let { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = rows[0];

    if (!user) {
      user = await this.usersService.create({
        username: `user_${phone}`,
        phone: phone,
        password: Math.random().toString(36).slice(-8),
        full_name: 'Customer',
        role: 'CUSTOMER',
      });
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.full_name,
        role: user.role,
      }
    };
  }
}