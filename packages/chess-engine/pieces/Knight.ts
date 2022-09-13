import Piece from './Piece';
import { Position, getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';

class Knight<T> extends Piece<T> {

  calculateAvailableCels() {
    this.availableCellsToMove = this.calculateCells();
  };

  calculateCellsToCapture() {
    this.cellsToCapture = this.getAvailableCells();
  }

  calculateCells() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    
    const newCoordinates = [
      new Position(coordinates).verticalShift(2).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(2).horizontalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(-2).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(2).getPostition(),
      new Position(coordinates).verticalShift(-2).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(-2).horizontalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(-2).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(2).getPostition(),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => {
      if (c === null) {
        return null;
      }

      const position = getPositionByCoordinates(c);
      const piece = this.pieces.getPieceByPosition(position);
      if (piece?.getColor() === this.getColor()) {
        return null;
      } else {
        return c;
      }
    });
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    return positions;
  }
};

export default Knight;