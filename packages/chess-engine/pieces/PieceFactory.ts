// import { PieceType } from '../helpers';
// import RenderablePiece from './RenderablePiece';
// import Pawn from './Pawn';
// import Knight from './Knight';
// import Piece from './RenderablePiece';
// import Bishop from './Bishop';
// import Rook from './Rook';
// import Queen from './Queen';
// import King from './King';

// class PieceFactory<T> {
//   createPiece(id: number, type: string, cell: T): Piece<T> {

//     if (type === PieceType.WN  || type === PieceType.BN) {
//       return new RenderablePiece(cell, new Knight<T>(id, type));
//     }

//     if (type === PieceType.WB  || type === PieceType.BB) {
//       return new RenderablePiece(cell, new Bishop<T>(id, type));
//     }

//     if (type === PieceType.WR  || type === PieceType.BR) {
//       return new RenderablePiece(cell, new Rook<T>(id, type));
//     }

//     if (type === PieceType.WQ  || type === PieceType.BQ) {
//       return new RenderablePiece(cell, new Queen<T>(id, type));
//     }

//     if (type === PieceType.WK  || type === PieceType.BK) {
//       return new RenderablePiece(cell, new King<T>(id, type));
//     }

//     return new RenderablePiece(cell, new Pawn<T>(id, type));
//   }
// }

// export default PieceFactory;