import Piece from './pieces/Piece';

export default class Move<T> {
  piece: Piece<T>;
  prevPosition: number;
  newPosition: number;

  constructor(piece: Piece<T>, prevPosition: number, newPosition: number) {
    this.piece = piece;
    this.prevPosition = prevPosition;
    this.newPosition = newPosition;
  }
}