import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import pool from '../../config/database.config';
import { WhatsappClientService } from '../whatsapp/whatsapp-client.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  private otpStore = new Map<string, { otp: string, expiresAt: number }>();

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

  async sendCustomerOtp(phone: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    this.otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const message = `Your Miniput login OTP is ${otp}. It is valid for 5 minutes.`;

    if (this.isLocalEnv()) {
      console.log(`[LOCAL DEV] WhatsApp bypassed. OTP for ${phone} is: ${otp} (You can also use 1111)`);
    } else {
      await this.whatsappClient.sendTextMessage(phone, message);
    }

    const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);

    return { success: true, exists: rows.length > 0 };
  }

  async verifyCustomerOtp(phone: string, otp: string) {
    const record = this.otpStore.get(phone);

    const isLocalBypass = this.isLocalEnv() && otp === '1111';

    if (!isLocalBypass) {
      if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
        throw new BadRequestException('Invalid or expired OTP');
      }
    }

    this.otpStore.delete(phone);

    let { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = rows[0];

    if (!user) {
      user = await this.usersService.create({
        username: `user_${phone}`,
        phone: phone,
        password: Math.random().toString(36).slice(-8),
        fullName: 'Customer',
        role: 'CUSTOMER',
      });
    }

    const accessToken = this.generateAccessToken(user);

    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.full_name,
        role: user.role,
      }
    };
  }
}