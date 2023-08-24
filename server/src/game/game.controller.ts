import { Controller, Get, Post, Req } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame(@Req() req: any) {
    const { userId } = req.body;

    return this.gameService.createGame(userId);
  }

  @Post('join')
  joinGame(@Req() req: any): any {
    const { userId, gameId } = req.body;

    return this.gameService.joinGame(gameId, userId);
  }
}
