import { PieceType } from './helpers';
import Pawn from './Pawn';
import Knight from './Knight';
import Piece from './Piece';
import Bishop from './Bishop';

class PieceFactory {
  static createPiece(id: number, type: string): Piece {
    if (type === PieceType.WP  || type === PieceType.BP) {
      return new Pawn(id, type);
    }

    if (type === PieceType.WN  || type === PieceType.BN) {
      return new Knight(id, type);
    }

    if (type === PieceType.WB  || type === PieceType.BB) {
      return new Bishop(id, type);
    }

    return new Piece(id, type);
  }
}

export default PieceFactory;