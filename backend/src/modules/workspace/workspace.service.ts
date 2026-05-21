import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  async create(dto: CreateWorkspaceDto) {
    const existing = await pool.query(
      `SELECT id FROM workspace WHERE LOWER(name) = LOWER($1)`,
      [dto.name],
    );

    if (existing.rows.length) {
      throw new BadRequestException('Workspace already exists');
    }

    const { rows } = await pool.query(
      `
      INSERT INTO workspace (
        id,
        name,
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
      `,
      [uuidv4(), dto.name.trim()],
    );

    return rows[0];
  }

  async findAll() {
    const { rows } = await pool.query(`
      SELECT *
      FROM workspace
      ORDER BY name ASC
    `);

    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(
      `SELECT * FROM workspace WHERE id = $1`,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException('Workspace not found');
    }

    return rows[0];
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    await this.findOne(id);

    const { rows } = await pool.query(
      `
      UPDATE workspace
      SET
        name = COALESCE($2, name),
        "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id, dto.name?.trim()],
    );

    return rows[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await pool.query(`DELETE FROM workspace WHERE id = $1`, [id]);

    return {
      success: true,
      message: 'Workspace deleted successfully',
    };
  }

  async validateWorkspaceExists(workspaceId: string) {
    const { rows } = await pool.query(
      `SELECT id FROM workspace WHERE id = $1`,
      [workspaceId],
    );

    if (!rows.length) {
      throw new BadRequestException('Invalid workspaceId');
    }
  }
}