import { IsDate, IsUUID } from 'class-validator';

export class FavoriteEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;

  @IsDate()
  createdAt: Date;
}