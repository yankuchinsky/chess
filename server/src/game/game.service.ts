import { Injectable } from '@nestjs/common';

enum GameStatus {
  Pending = 1,
  Started = 2,
}

interface IGame {
  id: string;
  user1: {
    id: string;
  };
  user2?: {
    id: string;
  };
  gameStatus: GameStatus;
}

@Injectable()
export class GameService {
  private games: IGame[] = [];

  startGame(): string {
    return 'Game started';
  }

  createGame(userId: string): any {
    const game: IGame = {
      id: this.games.length.toString(),
      user1: { id: userId },
      gameStatus: GameStatus.Pending,
    };

    this.games.push(game);
    console.log('this games', JSON.stringify(this.games));

    return game;
  }

  joinGame(gameId: string, userId: string) {
    const game = this.games.find((game) => game.id === gameId);
    if (!game) {
      return { error: 'Not Found' };
    }

    game.user2 = { id: userId };
    game.gameStatus = GameStatus.Started;

    return game;
  }
}
