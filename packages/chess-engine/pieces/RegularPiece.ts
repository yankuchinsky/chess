import AbstractPiece from './AbstractPiece';

abstract class RegularPiece<T> extends AbstractPiece<T> {
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