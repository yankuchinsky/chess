import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovesGateway } from './moves/moves.gateway';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/users.module';
import { UserService } from './user/user.service';

@Module({
  imports: [UserModule],
  controllers: [AppController, GameController, UserController],
  providers: [AppService, MovesGateway, GameService, UserService],
})
export class AppModule {}
