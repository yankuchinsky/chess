import Piece from './Piece';
import { calculateVerticalAvailableCells, getCoordinatesByPosition, getPositionByCoordinates, calculateDiagonalAvailableCells  } from '../helpers'
class Queen<T> extends Piece<T> {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...calculateDiagonalAvailableCells(coordinates),
      ...calculateVerticalAvailableCells(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove = positions;
  };
};

export default Queen;