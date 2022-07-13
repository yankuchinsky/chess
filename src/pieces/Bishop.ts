import Piece from './Piece';
import { getLeftDiagonalRange, getRightDiagonalRange, getCoordinatesByPosition, getPositionByCoordinates, Position } from '../helpers'

class Bishop extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const leftRange = getLeftDiagonalRange(coordinates).filter(c => !!c);
    const rightRange = getRightDiagonalRange(coordinates).filter(c => !!c);

    const tlBlockerCoords = new Position(coordinates).horizontalShift(-1).verticalShift(1).getPostition()!;
    const trBlockerCoords = new Position(coordinates).horizontalShift(1).verticalShift(1).getPostition()!;
    const blBlockerCoords = new Position(coordinates).horizontalShift(-1).verticalShift(-1).getPostition()!;
    const brBlockerCoords = new Position(coordinates).horizontalShift(1).verticalShift(-1).getPostition()!;


    const tlBlocker = tlBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(tlBlockerCoords));
    const trBlocker = trBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(trBlockerCoords));
    const blBlocker = blBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(blBlockerCoords));
    const brBlocker = brBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(brBlockerCoords));

    const idxLeft = leftRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
    const idxRight = rightRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);

    const tlRange = leftRange.slice(idxLeft, leftRange.length);
    const brRange = leftRange.slice(0, idxLeft);
    const blRange = rightRange.slice(0, idxRight);
    const trRange = rightRange.slice(idxRight, rightRange.length);

    const newCoordinates: [number, number][] = [];

    if (!tlBlocker) {
      tlRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!trBlocker) {
      trRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!blBlocker) {
      blRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!brBlocker) {
      brRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    const filteredCoordinates = <[number, number][]>newCoordinates;
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Bishop;