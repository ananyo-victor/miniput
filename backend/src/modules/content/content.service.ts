import { Injectable } from '@nestjs/common';
import pool from '../../config/database.config';
import { AboutContentEntity } from './entities/about-content.entity';
import { UpsertAboutContentDto } from './dto/upsert-about-content.dto';
import { UpsertHomeContentDto } from './dto/upsert-home-content.dto';

const normalizeStringArray = (value: any) => {
  if (!Array.isArray(value)) return null;
  return value.map((item) => String(item || '').trim()).filter((item) => item.length > 0);
};

const validateHeroImages = (items: string[]) => {
  if (!Array.isArray(items)) {
    return items;
  }

  if (items.length > 4) {
    throw new Error('Hero images cannot exceed 4 per brand');
  }

  return items;
};

@Injectable()
export class ContentService {
  private async validateWorkspaceExists(
    workspaceId: string,
  ) {
    const { rows } = await pool.query(
      `SELECT id FROM workspace WHERE id = $1`,
      [workspaceId],
    );

    if (!rows.length) {
      throw new Error('Invalid workspaceId');
    }
  }
  async getHomeContent(workspaceId: string) {
    await this.validateWorkspaceExists(workspaceId);

    const { rows } = await pool.query(
      `
    SELECT
      "workspaceId",
      hero_image_urls,
      promo_tags,
      "updatedAt"
    FROM brand_home_content
    WHERE "workspaceId" = $1
    `,
      [workspaceId],
    );

    if (!rows.length) {
      return {
        workspaceId,
        heroImageUrls: [],
        promoTags: [],
      };
    }

    return {
      workspaceId: rows[0].workspaceId,
      heroImageUrls:
        rows[0].hero_image_urls || [],
      promoTags:
        rows[0].promo_tags || [],
      updatedAt: rows[0].updatedAt,
    };
  }

  async upsertHomeContent(
    workspaceId: string,
    payload: UpsertHomeContentDto,
  ) {
    await this.validateWorkspaceExists(workspaceId);

    const heroImageUrls =
      normalizeStringArray(
        payload.heroImageUrls ??
        payload.heroImages ??
        payload.imageUrls,
      );

    const promoTags =
      normalizeStringArray(
        payload.promoTags
      );

    const { rows: existingRows } =
      await pool.query(
        `
      SELECT hero_image_urls, promo_tags
      FROM brand_home_content
      WHERE "workspaceId" = $1
      `,
        [workspaceId],
      );

    const current = existingRows[0] || {
      hero_image_urls: [],
      promo_tags: [],
    };

    const mergedHero = validateHeroImages(
      heroImageUrls === null
        ? current.hero_image_urls
        : heroImageUrls,
    );

    const mergedTags =
      promoTags === null
        ? current.promo_tags
        : promoTags;

    const { rows } = await pool.query(
      `
    INSERT INTO brand_home_content (
      "workspaceId",
      hero_image_urls,
      promo_tags
    )
    VALUES ($1, $2, $3)
    ON CONFLICT ("workspaceId")
    DO UPDATE SET
      hero_image_urls = EXCLUDED.hero_image_urls,
      promo_tags = EXCLUDED.promo_tags,
      "updatedAt" = NOW()
    RETURNING *
    `,
      [
        workspaceId,
        mergedHero,
        mergedTags,
      ],
    );

    return {
      workspaceId: rows[0].workspaceId,
      heroImageUrls:
        rows[0].hero_image_urls || [],
      promoTags:
        rows[0].promo_tags || [],
      updatedAt: rows[0].updatedAt,
    };
  }

  async getAboutContent(): Promise<AboutContentEntity> {
    const { rows } = await pool.query(
      `
      SELECT id, miniput_details, kwink_details, address, whatsapp_number, phone_number, "updatedAt"
      FROM about_content
      WHERE id = 1
      `,
    );

    const row = rows[0] || {
      miniput_details: [],
      kwink_details: [],
      address: '',
      whatsapp_number: '',
      phone_number: '',
    };

    return {
      miniputDetails: row.miniput_details || [],
      kwinkDetails: row.kwink_details || [],
      address: row.address,
      whatsappNumber: row.whatsapp_number,
      phoneNumber: row.phone_number,
      updatedAt: row.updatedAt,
    };
  }

  async upsertAboutContent(payload: UpsertAboutContentDto): Promise<AboutContentEntity> {
    const miniputDetails = normalizeStringArray(payload.miniputDetails);
    const kwinkDetails = normalizeStringArray(payload.kwinkDetails);

    const address = payload.address === undefined ? null : String(payload.address || '').trim();
    const whatsappNumber = payload.whatsappNumber === undefined ? null : String(payload.whatsappNumber || '').trim();
    const phoneNumber = payload.phoneNumber === undefined ? null : String(payload.phoneNumber || '').trim();

    const { rows } = await pool.query(
      `
      INSERT INTO about_content (id, miniput_details, kwink_details, address, whatsapp_number, phone_number)
      VALUES (
        1,
        COALESCE($1, '{}'::TEXT[]),
        COALESCE($2, '{}'::TEXT[]),
        COALESCE($3, ''),
        COALESCE($4, ''),
        COALESCE($5, '')
      )
      ON CONFLICT (id)
      DO UPDATE SET
        miniput_details = COALESCE($1, about_content.miniput_details),
        kwink_details = COALESCE($2, about_content.kwink_details),
        address = COALESCE($3, about_content.address),
        whatsapp_number = COALESCE($4, about_content.whatsapp_number),
        phone_number = COALESCE($5, about_content.phone_number),
        "updatedAt" = NOW()
      RETURNING miniput_details, kwink_details, address, whatsapp_number, phone_number, "updatedAt"
      `,
      [
        miniputDetails,
        kwinkDetails,
        address,
        whatsappNumber,
        phoneNumber,
      ],
    );

    return {
      miniputDetails: rows[0].miniput_details || [],
      kwinkDetails: rows[0].kwink_details || [],
      address: rows[0].address,
      whatsappNumber: rows[0].whatsapp_number,
      phoneNumber: rows[0].phone_number,
      updatedAt: rows[0].updatedAt,
    };
  }
}
