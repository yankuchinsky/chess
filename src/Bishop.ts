import Piece from './Piece';
import { getDiagonalRange, getCoordinatesByPosition, getPositionByCoordinates } from './helpers'
class Bishop extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...getDiagonalRange(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Bishop;