import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  startGame(): string {
    return 'Game started';
  }

  createGame(): any {
    return 'Create game';
  }
}
