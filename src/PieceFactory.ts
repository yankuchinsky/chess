import { PieceType } from './helpers';
import Pawn from './Pawn';
import Piece from './Piece';

class PieceFactory {
  static createPiece(id: number, type: string): Piece {
    if (type === PieceType.WP  || type === PieceType.BP) {
      return new Pawn(id, type);
    }

    return new Piece(id, type);
  }
}

export default PieceFactory;