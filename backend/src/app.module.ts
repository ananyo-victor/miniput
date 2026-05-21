import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';

@Module({
  imports: [AuthModule, ContentModule, OrdersModule, ProductsModule, UploadsModule, WorkspaceModule],
})
export class AppModule { }
