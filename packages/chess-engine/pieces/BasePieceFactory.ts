import { PieceType } from '../helpers';
import Pawn from './Pawn';
import Knight from './Knight';
import AbstractPiece from './AbstractPiece';
import Bishop from './Bishop';
import Rook from './Rook';
import Queen from './Queen';
import King from './King';

class BasePieceFactory<T> {
  createPiece(id: number, type: string): AbstractPiece<T> {

    if (type === PieceType.WN  || type === PieceType.BN) {
      return new Knight<T>(id, type);
    }

    if (type === PieceType.WB  || type === PieceType.BB) {
      return new Bishop<T>(id, type);
    }

    if (type === PieceType.WR  || type === PieceType.BR) {
      return new Rook<T>(id, type);
    }

    if (type === PieceType.WQ  || type === PieceType.BQ) {
      return new Queen<T>(id, type);
    }

    if (type === PieceType.WK  || type === PieceType.BK) {
      return new King<T>(id, type);
    }

    return new Pawn<T>(id, type);
  }
}

export default BasePieceFactory;