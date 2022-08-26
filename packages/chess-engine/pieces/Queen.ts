import Piece from './Piece';
import { getCoordinatesByPosition, getPositionByCoordinates } from '../helpers';

class Queen<T> extends Piece<T> {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      ...this.globalGameState.calculateDiagonalAvailableCells(coordinates),
      ...this.globalGameState.calculateVerticalAvailableCells(coordinates),
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove = positions;
  };
};

export default Queen;