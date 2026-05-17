import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import { AdminTokenPayload } from './entities/auth.entity';

@Injectable()
export class AuthService {
  verifyAdminCredentials(userId: string, password: string) {
    return userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS;
  }

  generateAccessToken(userId: string) {
    return jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }

  generateRefreshToken(userId: string) {
    return jwt.sign(
      { id: userId, role: 'admin' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );
  }

  verifyRefreshToken(token: string): AdminTokenPayload | null {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      ) as AdminTokenPayload;
    } catch {
      return null;
    }
  }

  generateToken(userId: string) {
    return this.generateAccessToken(userId);
  }
}
