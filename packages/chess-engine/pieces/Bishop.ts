import Piece from './Piece';
import { getCoordinatesByPosition, getPositionByCoordinates } from '../helpers'

class Bishop<T> extends Piece<T> {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const newCoordinates = this.globalGameState.calculateDiagonalAvailableCells(coordinates);
    const filteredCoordinates = <[number, number][]>newCoordinates;
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove = positions
  };

  calculateCellsToCapture(): void {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const ranges = this.globalGameState.calculateDiagonalRanges(coordinates);
    const filteredRanges: [number, number][] = [];
    ranges.forEach(range => filteredRanges.push(...range));
    const positions = filteredRanges.map(c => getPositionByCoordinates(c));

    this.cellsToCapture = positions;
  };
};

export default Bishop;