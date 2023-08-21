import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovesGateway } from './moves/moves.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MovesGateway],
})
export class AppModule {}
