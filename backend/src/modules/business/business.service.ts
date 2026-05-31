import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  async create(
    userId: string,
    dto: CreateBusinessDto,
  ) {
    if (dto.isDefault) {
      await pool.query(
        `
        UPDATE businesses
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [userId],
      );
    }

    const { rows } = await pool.query(
      `
      INSERT INTO businesses (
        id, user_id, business_name, business_phone, delivery_address,
        transport_courier, gst_number, agent_name, filled_by,
        special_instructions, is_default, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [
        uuidv4(),
        userId,
        dto.businessName || null,
        dto.businessPhone || null,
        dto.deliveryAddress || null,
        dto.transportCourier || null,
        dto.gstNumber || null,
        dto.agentName || null,
        dto.filledBy || null,
        dto.specialInstructions || null,
        dto.isDefault || false,
      ],
    );

    return rows[0];
  }

  async findAll(userId: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM businesses
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM businesses
      WHERE id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Business not found',
      );
    }

    return rows[0];
  }

  async update(
    id: string,
    dto: UpdateBusinessDto,
  ) {
    await this.findOne(id);

    if (dto.isDefault) {
      const business =
        await this.findOne(id);

      await pool.query(
        `
        UPDATE businesses
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [business.user_id],
      );
    }

    const { rows } = await pool.query(
      `
      UPDATE businesses
      SET
        business_name = COALESCE($2, business_name),
        business_phone = COALESCE($3, business_phone),
        delivery_address = COALESCE($4, delivery_address),
        transport_courier = COALESCE($5, transport_courier),
        gst_number = COALESCE($6, gst_number),
        agent_name = COALESCE($7, agent_name),
        filled_by = COALESCE($8, filled_by),
        special_instructions = COALESCE($9, special_instructions),
        is_default = COALESCE($10, is_default),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        dto.businessName,
        dto.businessPhone,
        dto.deliveryAddress,
        dto.transportCourier,
        dto.gstNumber,
        dto.agentName,
        dto.filledBy,
        dto.specialInstructions,
        dto.isDefault,
      ],
    );

    return rows[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await pool.query(
      `
      DELETE FROM businesses
      WHERE id = $1
      `,
      [id],
    );

    return {
      success: true,
      message:
        'Business deleted successfully',
    };
  }
}