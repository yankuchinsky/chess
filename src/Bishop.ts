import Piece from './Piece';
import { getLeftDiagonalRange, getRightDiagonalRange, getCoordinatesByPosition, getPositionByCoordinates } from './helpers'
class Bishop extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...getLeftDiagonalRange(coordinates),
      ...getRightDiagonalRange(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Bishop;