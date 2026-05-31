import { IsNumber, Min } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}