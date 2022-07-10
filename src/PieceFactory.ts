import { PieceType } from './helpers';
import Pawn from './pieces/Pawn';
import Knight from './pieces/Knight';
import Piece from './pieces/Piece';
import Bishop from './pieces/Bishop';
import Rook from './pieces/Rook';
import Queen from './pieces/Queen';
import King from './pieces/King';

class PieceFactory {
  static createPiece(id: number, type: string, cell: HTMLDivElement): Piece {
    if (type === PieceType.WP  || type === PieceType.BP) {
      return new Pawn(id, type, cell);
    }

    if (type === PieceType.WN  || type === PieceType.BN) {
      return new Knight(id, type, cell);
    }

    if (type === PieceType.WB  || type === PieceType.BB) {
      return new Bishop(id, type, cell);
    }

    if (type === PieceType.WR  || type === PieceType.BR) {
      return new Rook(id, type, cell);
    }

    if (type === PieceType.WQ  || type === PieceType.BQ) {
      return new Queen(id, type, cell);
    }

    if (type === PieceType.WK  || type === PieceType.BK) {
      return new King(id, type, cell);
    }

    return new Piece(id, type, cell);
  }
}

export default PieceFactory;