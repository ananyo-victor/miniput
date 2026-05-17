import { IsBoolean } from 'class-validator';

export class UpdateProductVisibilityDto {
  @IsBoolean()
  isHidden: boolean;
}
