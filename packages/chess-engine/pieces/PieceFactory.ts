import { PieceType } from '../helpers';
import Pawn from './Pawn';
import Knight from './Knight';
import Piece from './Piece';
import Bishop from './Bishop';
import Rook from './Rook';
import Queen from './Queen';
import King from './King';

class PieceFactory<T> {
  createPiece(id: number, type: string, cell: T): Piece<T> {

    if (type === PieceType.WN  || type === PieceType.BN) {
      return new Knight<T>(id, type, cell);
    }

    if (type === PieceType.WB  || type === PieceType.BB) {
      return new Bishop<T>(id, type, cell);
    }

    if (type === PieceType.WR  || type === PieceType.BR) {
      return new Rook<T>(id, type, cell);
    }

    if (type === PieceType.WQ  || type === PieceType.BQ) {
      return new Queen<T>(id, type, cell);
    }

    if (type === PieceType.WK  || type === PieceType.BK) {
      return new King<T>(id, type, cell);
    }

    return new Pawn<T>(id, type, cell);
  }
}

export default PieceFactory;