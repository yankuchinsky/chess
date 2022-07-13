import Piece from './Piece';
import { getPositionByCoordinates, getCoordinatesByPosition, getVerticalRange, getHorizontalRange, Position } from '../helpers';

class Rook extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const tBlockerCoords = new Position(coordinates).verticalShift(1).getPostition()!;
    const lBlockerCoords = new Position(coordinates).horizontalShift(-1).getPostition()!;
    const rBlockerCoords = new Position(coordinates).horizontalShift(1).getPostition()!;
    const bBlockerCoords = new Position(coordinates).verticalShift(-1).getPostition()!;

    const tBlocker = tBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(tBlockerCoords));
    const lBlocker = lBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(lBlockerCoords));
    const rBlocker = rBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(rBlockerCoords));
    const bBlocker = bBlockerCoords && this.pieces.getPieceByPosition(getPositionByCoordinates(bBlockerCoords));

    const horizontalRange = getHorizontalRange(coordinates);
    const verticalRange = getVerticalRange(coordinates);

    const idxHorizontal = horizontalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
    const idxVertical = verticalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);


    const lRange = horizontalRange.slice(0, idxHorizontal);
    const rRange = horizontalRange.slice(idxHorizontal, horizontalRange.length);
    const tRange = verticalRange.slice(idxVertical, verticalRange.length);
    const bRange = verticalRange.slice(0, idxVertical);

    const newCoordinates: [number, number][] = [];

    if (!tBlocker) {
      tRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!lBlocker) {
      lRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!rBlocker) {
      rRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    if (!bBlocker) {
      bRange.forEach(c => {
        newCoordinates.push(c);
      });
    }

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };
};

export default Rook;