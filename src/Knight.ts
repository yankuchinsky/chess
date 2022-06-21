import Piece from './Piece';
import { horizontalMove, absUpMove } from './helpers';
import { isPathBlocked } from './helpers';

class Knight extends Piece {
  override availableCellsToMove: number[] = []; 

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();

    const top2 = absUpMove(curr, 2);
    if (top2) {
      const right = horizontalMove(top2, 1);
      const left = horizontalMove(top2, -1);
      if (right) {
        this.availableCellsToMove.push(right);
      }
      if (left) {
        this.availableCellsToMove.push(left);
      }
    }

    const top1 = absUpMove(curr, 1);

    if (top1) {
      const right = horizontalMove(top1, 2);
      const left = horizontalMove(top1, -2);

      if (right) {
        this.availableCellsToMove.push(right);
      }
      if (left) {
        this.availableCellsToMove.push(left);
      }
    }

    const bot1 = absUpMove(curr, -1);

    if (bot1) {
      const right = horizontalMove(bot1, 2);
      const left = horizontalMove(bot1, -2);

      if (right) {
        this.availableCellsToMove.push(right);
      }
      if (left) {
        this.availableCellsToMove.push(left);
      }
    }

    const bot2 = absUpMove(curr, -2);
    if (bot2) {
      const right = horizontalMove(bot2, 1);
      const left = horizontalMove(bot2, -1);
      if (right) {
        this.availableCellsToMove.push(right);
      }
      if (left) {
        this.availableCellsToMove.push(left);
      }
    }

    isPathBlocked(this.availableCellsToMove);
  };
};

export default Knight;