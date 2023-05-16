import Piece from './Piece';

abstract class RegularPiece<T> extends Piece<T> {
  protected isBindedToKing = false;

  isBinded() {
    return this.isBindedToKing;
  }

  protected bindToKing(rangeToBing: number[]){};

  unbind() {
    this.isBindedToKing = false;
  }
}

export default RegularPiece;