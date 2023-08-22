import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private games = [];

  startGame(): string {
    return 'Game started';
  }

  createGame(): any {
    const game = {
      id: this.games.length,
    };

    this.games.push(game);
    console.log('this games', JSON.stringify(this.games));

    return game;
  }
}
