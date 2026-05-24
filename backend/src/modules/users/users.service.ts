import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import pool from '../../config/database.config';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  async validateWorkspaceExists(
    workspaceId?: string | null,
  ) {
    if (!workspaceId) {
      return;
    }

    const { rows } = await pool.query(
      `
      SELECT id
      FROM workspace
      WHERE id = $1
      `,
      [workspaceId],
    );

    if (!rows.length) {
      throw new BadRequestException(
        'Invalid activeWorkspaceId',
      );
    }
  }

  async create(dto: CreateUserDto) {
    await this.validateWorkspaceExists(
      dto.activeWorkspaceId,
    );

    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Either email or phone is required',
      );
    }

    if (dto.email) {
      const existingEmail =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
          `,
          [dto.email],
        );

      if (existingEmail.rows.length) {
        throw new BadRequestException(
          'Email already exists',
        );
      }
    }

    if (dto.phone) {
      const existingPhone =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE phone = $1
          `,
          [dto.phone],
        );

      if (existingPhone.rows.length) {
        throw new BadRequestException(
          'Phone already exists',
        );
      }
    }

    const existingUsername =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE LOWER(username) = LOWER($1)
          `,
        [dto.username],
      );

    if (existingUsername.rows.length) {
      throw new BadRequestException(
        'Username already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 10);

    const { rows } = await pool.query(
      `
      INSERT INTO users (
        id,
        username,
        email,
        phone,
        password_hash,
        full_name,
        role,
        "activeWorkspaceId",
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        true,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [
        uuidv4(),
        dto.username,
        dto.email || null,
        dto.phone || null,
        passwordHash,
        dto.fullName,
        dto.role || 'admin',
        dto.activeWorkspaceId || null,
      ],
    );

    return rows[0];
  }

  async findAll() {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.phone,
        u.full_name,
        u.role,
        u."activeWorkspaceId",
        u.is_active,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        w.name as workspace_name
      FROM users u
      LEFT JOIN workspace w
      ON w.id = u."activeWorkspaceId"
      ORDER BY u.created_at DESC
    `);

    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.phone,
        u.full_name,
        u.role,
        u."activeWorkspaceId",
        u.is_active,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        w.name as workspace_name
      FROM users u
      LEFT JOIN workspace w
      ON w.id = u."activeWorkspaceId"
      WHERE u.id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return rows[0];
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    await this.findOne(id);

    await this.validateWorkspaceExists(
      dto.activeWorkspaceId,
    );

    let passwordHash: string | null = null;

    if (dto.password) {
      passwordHash =
        await bcrypt.hash(dto.password, 10);
    }

    const { rows } = await pool.query(
      `
      UPDATE users
      SET
        username = COALESCE($2, username),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        password_hash = COALESCE($5, password_hash),
        full_name = COALESCE($6, full_name),
        role = COALESCE($7, role),
        "activeWorkspaceId" = COALESCE($8, "activeWorkspaceId"),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        dto.username,
        dto.email,
        dto.phone,
        passwordHash,
        dto.fullName,
        dto.role,
        dto.activeWorkspaceId,
      ],
    );

    return rows[0];
  }

  async updateActiveWorkspace(
    id: string,
    workspaceId: string,
  ) {
    await this.findOne(id);

    await this.validateWorkspaceExists(
      workspaceId,
    );

    const { rows } = await pool.query(
      `
      UPDATE users
      SET
        "activeWorkspaceId" = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id, workspaceId],
    );

    return rows[0];
  }

  async getActiveWorkspace(id: string) {
    const { rows } = await pool.query(
      `
      SELECT
        w.id,
        w.name
      FROM users u
      JOIN workspace w
      ON w.id = u."activeWorkspaceId"
      WHERE u.id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Active workspace not found for user',
      );
    }

    return rows[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [id],
    );

    return {
      success: true,
      message:
        'User deleted successfully',
    };
  }
} 