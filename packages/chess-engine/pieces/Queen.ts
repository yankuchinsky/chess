import RegularPiece from './RegularPiece';
import AbstractPiece from './AbstractPiece';
import { getCoordinatesByPosition, getPositionByCoordinates } from '../helpers';

class Queen<T> extends AbstractPiece<T> {

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

  calculateCellsToCapture(): void {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const ranges = [
      ...this.globalGameState.calcVerticalRanges(coordinates),
      ...this.globalGameState.calculateDiagonalRanges(coordinates),
    ];
    const filteredRanges: [number, number][] = [];
    ranges.forEach(range => filteredRanges.push(...range));
    const positions = filteredRanges.map(c => getPositionByCoordinates(c));

    this.cellsToCapture = positions;
  };
};

export default Queen;