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

  calcPath() {
    this.pieces.forEach(piece => piece.calculateAvailableCels());
  }
}

export default Player;