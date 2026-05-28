import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class WorkspaceHomeContentEntity {
  @IsUUID()
  workspaceId: string;

  @IsArray()
  @IsString({ each: true })
  heroImageUrls: string[];

  @IsArray()
  @IsString({ each: true })
  promoTags: string[];

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}