import Piece from './Piece';
import { upMove } from './helpers';

class Pawn extends Piece {
  private isMoved = false;
  override availableCellsToMove: number[] = []; 

  calculateAvailableCels(postion: number[]) {
    const upCell = upMove(this.getCurrentPosition(), this.getColor());
    this.availableCellsToMove.push(upCell);

    if (!this.isMoved) {
      const cell = upMove(this.getCurrentPosition(), this.getColor(), 2);
      this.availableCellsToMove.push(cell);
    }
  };
};

export default Pawn;