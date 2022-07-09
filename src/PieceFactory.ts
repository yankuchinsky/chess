import { PieceType } from './helpers';
import Pawn from './pieces/Pawn';
import Knight from './pieces/Knight';
import Piece from './pieces/Piece';
import Bishop from './pieces/Bishop';
import Rook from './pieces/Rook';
import Queen from './pieces/Queen'

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

    if (type === PieceType.WR  || type === PieceType.BR) {
      return new Rook(id, type);
    }

    if (type === PieceType.WQ  || type === PieceType.BQ) {
      return new Queen(id, type);
    }

    return new Piece(id, type);
  }
}

export default PieceFactory;