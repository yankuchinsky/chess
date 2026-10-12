import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class MovesGateway implements OnGatewayConnection {
  private clients = [];
  private moves: any = [];

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    this.clients.push(client);
  }

  handleDisconnect(client) {
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i] === client) {
        this.clients.splice(i, 1);
        break;
      }
    }
    this.broadcast('disconnect', {});
  }

  private broadcast(event, message: any) {
    const broadCastMessage = JSON.stringify(message);
    for (const c of this.clients) {
      c.send(event, broadCastMessage);
    }
  }

  @SubscribeMessage('event')
  handleEvent(@MessageBody() payload: any): any {
    this.moves.push(payload.data);
    this.server.emit('move', this.moves);
  }
}
