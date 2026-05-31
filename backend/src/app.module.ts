import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CartModule } from './modules/cart/cart.module';
import { BusinessModule } from './modules/business/business.module';

@Module({
  imports: [AuthModule, ContentModule, OrdersModule, ProductsModule, UploadsModule, WorkspaceModule, UsersModule, WhatsappModule, FavoritesModule, CartModule, BusinessModule],
})
export class AppModule { }
