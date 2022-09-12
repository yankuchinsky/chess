import Piece from './Piece';
import { getCoordinatesByPosition, getPositionByCoordinates, Position, upMove } from '../helpers';

class Pawn<T> extends Piece<T> {
  private isMoved = false;
  
  getCellsToCapture() {
    const cells: number[] = [];
    const color = this.getColor();
    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const verticalShift = color === 'w' ? 1 : -1;
    const leftPositionCoordinates = new Position(coordinates).verticalShift(verticalShift).horizontalShift(-1).getPostition();
    const rightPositionCoordinates = new Position(coordinates).verticalShift(verticalShift).horizontalShift(1).getPostition();
    
    if (leftPositionCoordinates) {
      const leftPosition = getPositionByCoordinates(leftPositionCoordinates);
      const leftPiece: Piece<T> | undefined = this.pieces.getPieceByPosition(leftPosition);

      if (leftPiece && leftPiece.getColor() !== color) {
        cells.push(leftPiece.getCurrentPosition());
      } 
    }

    if (rightPositionCoordinates) {
      const rightPosition = getPositionByCoordinates(rightPositionCoordinates);
      const rightPiece: Piece<T> | undefined = this.pieces.getPieceByPosition(rightPosition);

      if (rightPiece && rightPiece.getColor() !== color) {
        cells.push(rightPiece.getCurrentPosition());
      } 
    }

    return cells;
  }

  move(cell: { cellToMoveId: number, cell: T }, callback?: Function) {
    super.move(cell, callback);

    this.isMoved = true;
  }

  calculateAvailableCels() {
    const upCell = upMove(this.getCurrentPosition(), this.getColor());
    const cellsToMove: number[] = []
    cellsToMove.push(upCell);

    const color = this.getColor();
    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const verticalShift = color === 'w' ? 1 : -1;
    const leftPositionCoordinates = new Position(coordinates).verticalShift(verticalShift).horizontalShift(-1).getPostition();
    const rightPositionCoordinates = new Position(coordinates).verticalShift(verticalShift).horizontalShift(1).getPostition();
    
    if (leftPositionCoordinates) {
      const leftPosition = getPositionByCoordinates(leftPositionCoordinates);
      const leftPiece = this.pieces.getPieceByPosition(leftPosition);

      if (leftPiece && leftPiece.getColor() !== color) {
        cellsToMove.push(leftPiece.getCurrentPosition());
      } 
    }

    if (rightPositionCoordinates) {
      const rightPosition = getPositionByCoordinates(rightPositionCoordinates);
      const rightPiece = this.pieces.getPieceByPosition(rightPosition);

      if (rightPiece && rightPiece.getColor() !== color) {
        cellsToMove.push(rightPiece.getCurrentPosition());
      } 
    }

    if (!this.isMoved) {
      const cell = upMove(this.getCurrentPosition(), this.getColor(), 2);
      cellsToMove.push(cell);
    }

    this.availableCellsToMove = cellsToMove;
  };
};

export default Pawn;