import Piece from './Piece';
import { Position, getPositionByCoordinates, getCoordinatesByPosition, getVerticalRange, getHorizontalRange } from './helpers';

class Rook extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...getVerticalRange(coordinates),
      ...getHorizontalRange(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Rook;