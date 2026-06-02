import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingProfileDto } from './create-billing-profile.dto';

export class UpdateBillingProfileDto extends PartialType(
  CreateBillingProfileDto,
) {}