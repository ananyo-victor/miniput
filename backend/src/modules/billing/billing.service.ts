import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import pool from '../../config/database.config';

import { CreateBillingProfileDto } from './dto/create-billing-profile.dto';
import { UpdateBillingProfileDto } from './dto/update-billing-profile.dto';

@Injectable()
export class BillingService {
  async create(
    userId: string,
    dto: CreateBillingProfileDto,
  ) {
    if (dto.isDefault) {
      await pool.query(
        `
        UPDATE billing_profiles
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [userId],
      );
    }

    const { rows } = await pool.query(
      `
      INSERT INTO billing_profiles (
        id,
        user_id,
        company_name,
        billing_name,
        billing_phone,
        billing_email,
        gst_number,
        pan_number,
        address_line_1,
        address_line_2,
        city,
        taluka,
        state,
        country,
        pincode,
        special_instructions,
        is_default,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [
        uuidv4(),
        userId,
        dto.companyName || null,
        dto.billingName,
        dto.billingPhone,
        dto.billingEmail || null,
        dto.gstNumber || null,
        dto.panNumber || null,
        dto.addressLine1,
        dto.addressLine2 || null,
        dto.city,
        dto.taluka || null,
        dto.state,
        dto.country || 'India',
        dto.pincode,
        dto.specialInstructions || null,
        dto.isDefault || false
      ],
    );

    return rows[0];
  }

  async findAll(userId: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM billing_profiles
      WHERE user_id = $1
      AND deleted_at IS NULL
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return rows;
  }

  async findDefault(userId: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM billing_profiles
      WHERE user_id = $1
        AND is_default = TRUE
        AND deleted_at IS NULL
      LIMIT 1
    `,
      [userId],
    );

    return rows[0] || null;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM billing_profiles
      WHERE id = $1
      AND deleted_at IS NULL
      `,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Billing profile not found',
      );
    }

    return rows[0];
  }

  async update(
    id: string,
    dto: UpdateBillingProfileDto,
  ) {
    const existing = await this.findOne(id);

    if (dto.isDefault) {
      await pool.query(
        `
        UPDATE billing_profiles
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [existing.user_id],
      );
    }

    const { rows } = await pool.query(
      `
      UPDATE billing_profiles
      SET
        company_name = COALESCE($2, company_name),
        billing_name = COALESCE($3, billing_name),
        billing_phone = COALESCE($4, billing_phone),
        billing_email = COALESCE($5, billing_email),
        gst_number = COALESCE($6, gst_number),
        pan_number = COALESCE($7, pan_number),
        address_line_1 = COALESCE($8, address_line_1),
        address_line_2 = COALESCE($9, address_line_2),
        city = COALESCE($10, city),
        taluka = COALESCE($11, taluka),
        state = COALESCE($12, state),
        country = COALESCE($13, country),
        pincode = COALESCE($14, pincode),
        special_instructions = COALESCE($15, special_instructions),
        is_default = COALESCE($16, is_default),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        dto.companyName,
        dto.billingName,
        dto.billingPhone,
        dto.billingEmail,
        dto.gstNumber,
        dto.panNumber,
        dto.addressLine1,
        dto.addressLine2,
        dto.city,
        dto.taluka,
        dto.state,
        dto.country,
        dto.pincode,
        dto.specialInstructions,
        dto.isDefault,
      ],
    );

    return rows[0];
  }

  async remove(id: string) {
    await pool.query(
      `
    UPDATE billing_profiles
    SET deleted_at = NOW()
    WHERE id = $1
    `,
      [id],
    );

    return {
      success: true,
      message: 'Billing profile deleted successfully',
    };
  }
}