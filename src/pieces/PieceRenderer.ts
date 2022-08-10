import Piece from './Piece';

export default abstract class PieceRenderer<T> {
  protected currentCell: T;
  abstract render(piece: Piece<T>);
  abstract remove(piece: Piece<T>);
  abstract returnNewRenderer(): PieceRenderer<T>;
}
