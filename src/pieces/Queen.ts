import Piece from './Piece';
import { getLeftDiagonalRange, getRightDiagonalRange, getCoordinatesByPosition, getPositionByCoordinates, getVerticalRange, getHorizontalRange  } from '../helpers'
class Queen extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...getLeftDiagonalRange(coordinates),
      ...getRightDiagonalRange(coordinates),
      ...getVerticalRange(coordinates),
      ...getHorizontalRange(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Queen;