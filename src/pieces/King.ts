import Piece from './Piece';
import { Position, getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';

class King extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    
    const newCoordinates = [
      new Position(coordinates).verticalShift(1).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(-1).getPostition(),
      new Position(coordinates).horizontalShift(1).getPostition(),
      new Position(coordinates).horizontalShift(-1).getPostition(),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default King;