import { PieceType } from '../helpers';
import Pawn from './Pawn';
import Knight from './Knight';
import Piece from './Piece';
import Bishop from './Bishop';
import Rook from './Rook';
import Queen from './Queen';
import King from './King';
import { DefaultRenderer } from './PieceRenderer';

class PieceFactory {
  static createPiece(id: number, type: string, cell: HTMLDivElement): Piece {

    if (type === PieceType.WN  || type === PieceType.BN) {
      return new Knight(id, type, cell, new DefaultRenderer());
    }

    if (type === PieceType.WB  || type === PieceType.BB) {
      return new Bishop(id, type, cell, new DefaultRenderer());
    }

    if (type === PieceType.WR  || type === PieceType.BR) {
      return new Rook(id, type, cell, new DefaultRenderer());
    }

    if (type === PieceType.WQ  || type === PieceType.BQ) {
      return new Queen(id, type, cell, new DefaultRenderer());
    }

    if (type === PieceType.WK  || type === PieceType.BK) {
      return new King(id, type, cell, new DefaultRenderer());
    }

    return new Pawn(id, type, cell, new DefaultRenderer());
  }
}

export default PieceFactory;