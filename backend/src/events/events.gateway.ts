import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id);
  }

  handleDisconnect() {
    console.log('User disconnected');
  }

  emitNewOrder(order: unknown) {
    this.server?.emit('new-order-received', order);
  }
}
