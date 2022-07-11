import Piece from './Piece';
import { getLeftDiagonalRange, getRightDiagonalRange, getCoordinatesByPosition, getPositionByCoordinates } from '../helpers'

class Bishop extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const leftRange = getLeftDiagonalRange(coordinates).filter(c => !!c);
    const rightRange = getRightDiagonalRange(coordinates).filter(c => !!c);
    const left = this.checkRangeForBlockers(leftRange);
    const right = this.checkRangeForBlockers(rightRange);

    const newCoordinates = [
      ...left,
      ...right,
    ];

    const filteredCoordinates = <[number, number][]>newCoordinates;
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };

  checkRangeForBlockers(coordinates: [number, number][]) {
    const res: [number, number][] = [];
    let isBlocked = false;
    let i = 0;
    while (!isBlocked && coordinates[i]) {
      const coord = coordinates[i];
      const position = getPositionByCoordinates(coord);
      const piece = this.pieces.getPieceByPosition(position);
      
      if (!piece) {
        res.push(coord);
      } else {
        isBlocked = true;
      }

      i += 1;
    }

    return res;
  }
};

export default Bishop;