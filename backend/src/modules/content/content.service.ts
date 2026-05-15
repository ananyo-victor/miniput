import { Injectable } from '@nestjs/common';
import pool from '../../config/database.config';

const normalizeBrand = (brand: string) => {
  const value = String(brand || '').trim().toLowerCase();
  if (value === 'miniput') return 'Miniput';
  if (value === 'kwink') return 'Kwink';
  throw new Error('Invalid brand. Allowed values: Miniput, Kwink');
};

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
  async getHomeContentByBrand(brandInput: string) {
    const brand = normalizeBrand(brandInput);
    const { rows } = await pool.query(
      `
      SELECT brand, hero_image_urls, promo_tags, "updatedAt"
      FROM brand_home_content
      WHERE brand = $1
      `,
      [brand],
    );

    if (!rows.length) {
      return {
        brand,
        heroImageUrls: [],
        promoTags: [],
      };
    }

    return {
      brand: rows[0].brand,
      heroImageUrls: rows[0].hero_image_urls || [],
      promoTags: rows[0].promo_tags || [],
      updatedAt: rows[0].updatedAt,
    };
  }

  async upsertHomeContentByBrand(brandInput: string, payload: any) {
    const brand = normalizeBrand(brandInput);
    const heroImageUrls = normalizeStringArray(payload.heroImageUrls ?? payload.heroImages ?? payload.imageUrls);
    const promoTags = normalizeStringArray(payload.promoTags ?? payload.offerTexts ?? payload.badges);

    const { rows: existingRows } = await pool.query(
      `SELECT hero_image_urls, promo_tags FROM brand_home_content WHERE brand = $1`,
      [brand],
    );

    const current = existingRows[0] || { hero_image_urls: [], promo_tags: [] };
    const mergedHero = validateHeroImages(heroImageUrls === null ? current.hero_image_urls : heroImageUrls);
    const mergedTags = promoTags === null ? current.promo_tags : promoTags;

    const { rows } = await pool.query(
      `
      INSERT INTO brand_home_content (brand, hero_image_urls, promo_tags)
      VALUES ($1, $2, $3)
      ON CONFLICT (brand)
      DO UPDATE SET
        hero_image_urls = EXCLUDED.hero_image_urls,
        promo_tags = EXCLUDED.promo_tags,
        "updatedAt" = NOW()
      RETURNING brand, hero_image_urls, promo_tags, "updatedAt"
      `,
      [brand, mergedHero, mergedTags],
    );

    return {
      brand: rows[0].brand,
      heroImageUrls: rows[0].hero_image_urls || [],
      promoTags: rows[0].promo_tags || [],
      updatedAt: rows[0].updatedAt,
    };
  }

  async getAboutContent() {
    const { rows } = await pool.query(
      `
      SELECT id, miniput_details, kwink_details, address, whatsapp_number, phone_number, "updatedAt"
      FROM about_content
      WHERE id = 1
      `,
    );

    const row = rows[0] || {
      miniput_details: '',
      kwink_details: '',
      address: '',
      whatsapp_number: '',
      phone_number: '',
    };

    return {
      miniputDetails: row.miniput_details,
      kwinkDetails: row.kwink_details,
      address: row.address,
      whatsappNumber: row.whatsapp_number,
      phoneNumber: row.phone_number,
      updatedAt: row.updatedAt,
    };
  }

  async upsertAboutContent(payload: any) {
    const next = {
      miniputDetails: payload.miniputDetails,
      kwinkDetails: payload.kwinkDetails,
      address: payload.address,
      whatsappNumber: payload.whatsappNumber,
      phoneNumber: payload.phoneNumber,
    };

    const asValue = (value: any) => (value === undefined ? null : String(value || '').trim());

    const { rows } = await pool.query(
      `
      INSERT INTO about_content (id, miniput_details, kwink_details, address, whatsapp_number, phone_number)
      VALUES (
        1,
        COALESCE($1, ''),
        COALESCE($2, ''),
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
        asValue(next.miniputDetails),
        asValue(next.kwinkDetails),
        asValue(next.address),
        asValue(next.whatsappNumber),
        asValue(next.phoneNumber),
      ],
    );

    return {
      miniputDetails: rows[0].miniput_details,
      kwinkDetails: rows[0].kwink_details,
      address: rows[0].address,
      whatsappNumber: rows[0].whatsapp_number,
      phoneNumber: rows[0].phone_number,
      updatedAt: rows[0].updatedAt,
    };
  }
}
