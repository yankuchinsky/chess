import RegularPiece from './RegularPiece';
import { getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';

class Rook<T> extends RegularPiece<T> {
  private ranges: number[][] = [];

  getRanges() {
    return this.ranges;
  }

  updateRange(cellInRange) {
    const range = this.ranges.find(c => ~c.indexOf(cellInRange));
    if (range) {
      this.ranges = [range];
    }
  }

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const newCoordinates = this.globalGameState.calculateVerticalAvailableCells(coordinates);
    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
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
      
      this.ranges.push(positionsRanges);
      newRanges.push(...rangePositions);
    });

    this.cellsToCapture = newRanges;
  };
};

export default Rook;
