import Piece from './Piece';
import { getPositionByCoordinates, getCoordinatesByPosition, calculateVerticalAvailableCells } from '../helpers';

class Rook extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const newCoordinates = calculateVerticalAvailableCells(coordinates);
    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove = positions;
  };
};

export default Rook;