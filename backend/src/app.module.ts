import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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

function parseEnvInteger(value: string | undefined, fallback: number): number {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

const throttlerTtl = parseEnvInteger(process.env.THROTTLE_TTL_MS, 60_000);
const throttlerLimit = parseEnvInteger(process.env.THROTTLE_LIMIT, 100);

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: throttlerTtl,
        limit: throttlerLimit,
      },
    ]),
    AuthModule,
    ContentModule,
    OrdersModule,
    ProductsModule,
    UploadsModule,
    WorkspaceModule,
    UsersModule,
    WhatsappModule,
    FavoritesModule,
    CartModule,
    BusinessModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
