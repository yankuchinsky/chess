import Piece from './Piece';

abstract class RegularPiece<T> extends Piece<T> {
  private isBindedToKing = false;

  isBinded() {
    return this.isBindedToKing;
  }

  bindToKing() {
    this.isBindedToKing = true;
  }

  unbind() {
    this.isBindedToKing = false;
  }
}

export default RegularPiece;