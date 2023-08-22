import { Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  getStartGame(): string {
    return this.gameService.startGame();
  }

  @Get()
  getCreateGame(): any {
    return this.gameService.createGame();
  }
}
