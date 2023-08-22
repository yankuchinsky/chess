import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovesGateway } from './moves/moves.gateway';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';

@Module({
  imports: [],
  controllers: [AppController, GameController],
  providers: [AppService, MovesGateway, GameService],
})
export class AppModule {}
