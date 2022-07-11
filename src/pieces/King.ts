import Piece from './Piece';
import { Position, getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';

class King extends Piece {
  private hasCastled = false;
  private isKingMoved = false;

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);

    const newCoordinates = [
      new Position(coordinates).verticalShift(1).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(1).horizontalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(-1).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(1).getPostition(),
      new Position(coordinates).verticalShift(-1).horizontalShift(-1).getPostition(),
      new Position(coordinates).horizontalShift(1).getPostition(),
      new Position(coordinates).horizontalShift(-1).getPostition(),
    ];

    if (!this.hasCastled && !this.isKingMoved) {
      if (this.castleShort()) {
        newCoordinates.push(new Position(coordinates).horizontalShift(2).getPostition());
      }
      if (this.castleLong()) {
        newCoordinates.push(new Position(coordinates).horizontalShift(-2).getPostition());
      }
    }

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(c => c !== null)
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove.push(...positions);
  };

  castleShort() {
    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const firstPieceCoordinates = new Position(coordinates).horizontalShift(1).getPostition()!;
    const secondPieceCoordinates = new Position(coordinates).horizontalShift(2).getPostition()!;

    const firstPiecePosition = getPositionByCoordinates(firstPieceCoordinates);
    const secondPiecePosition = getPositionByCoordinates(secondPieceCoordinates);
    const firstPiece = this.pieces.getPieceByPosition(firstPiecePosition);
    const secondPiece = this.pieces.getPieceByPosition(secondPiecePosition);

    if (!firstPiece && !secondPiece) {
      return true;
    }

    return false;
  }

  castleLong() {
    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const firstPieceCoordinates = new Position(coordinates).horizontalShift(-1).getPostition()!;
    const secondPieceCoordinates = new Position(coordinates).horizontalShift(-2).getPostition()!;
    const thirdPieceCoordinates = new Position(coordinates).horizontalShift(-3).getPostition()!;


    const firstPiecePosition = getPositionByCoordinates(firstPieceCoordinates);
    const secondPiecePosition = getPositionByCoordinates(secondPieceCoordinates);
    const thirdPiecePosition = getPositionByCoordinates(thirdPieceCoordinates);

    const firstPiece = this.pieces.getPieceByPosition(firstPiecePosition);
    const secondPiece = this.pieces.getPieceByPosition(secondPiecePosition);
    const thirdPiece = this.pieces.getPieceByPosition(thirdPiecePosition);
    

    if (!firstPiece && !secondPiece && !thirdPiece) {
      return true;
    }

    return false;
  }

};

export default King;