import Piece from './pieces/Piece';

class Player {
  color: TColor;
  pieces: Piece[];

  constructor(color: TColor) {
    this.color = color;
  }

  setPieces(pieces: Piece[]) {
    this.pieces = pieces;
  }

  calcPath(callback: Function) {
    this.pieces.forEach(piece => piece.calculateAvailableCels());
    callback();
  }

  getKing() {
    this.pieces.find(piece => piece.getPiecetype() === 'k');
  }
}

export default Player;