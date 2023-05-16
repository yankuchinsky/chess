import RegularPiece from './RegularPiece';
import { getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';

class Rook<T> extends RegularPiece<T> {
  private ranges: number[][] = [];

  getRanges() {
    return this.ranges;
  }

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const newCoordinates = this.globalGameState.calculateVerticalAvailableCells(coordinates);
    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null);
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));
    this.availableCellsToMove = positions;
  };

  calculateCellsToCapture(): void {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const ranges = this.globalGameState.calcVerticalRanges(coordinates);
    const color = this.getColor();
    const opponentColor = color === 'w' ? 'b' : 'w';
    
    const oponentPieces = this.pieces.getPiecesWithoutKing(opponentColor);
    const opponentPiecesPositions = oponentPieces.map(c => c.getCurrentPosition());
    const newRanges: number[] = [];

    const tmpRanges: number[][] = [];

    ranges.forEach(range => {
      const rangePositions: number[] = [];
      const positionsRanges = range.map(c => getPositionByCoordinates(c));

      for (let i = 0; i < range.length; i++) {
        const pos = getPositionByCoordinates(range[i]);
        
        if (opponentPiecesPositions.includes(pos)) {
          break;
        }
        
        rangePositions.push(pos);
      }
      tmpRanges.push(positionsRanges);
      newRanges.push(...rangePositions);
    });

    this.ranges = tmpRanges;

    this.cellsToCapture = newRanges;
  };

  recalc() {
    this.cellsToCapture = this.ranges.flat();
    const newAvailableCells = this.availableCellsToMove.filter(cell => ~this.cellsToCapture.indexOf(cell));
    this.availableCellsToMove = newAvailableCells;
  }

  bindToKing(rangeToBing: number[]) {
    this.isBindedToKing = true;
    const ranges = this.ranges.filter(range => range.some(r => ~rangeToBing.indexOf(r)));
    this.ranges = ranges;

    this.recalc();
  }

};

export default Rook;
