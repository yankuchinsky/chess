import AbstractPiece from './AbstractPiece';
import { getPositionByCoordinates, getCoordinatesByPosition } from '../helpers';
import RegularPiece from './RegularPiece';

import Position from '../helpers/Position';
import Rook from './Rook';

class King<T> extends AbstractPiece<T> {
  private hasCastled = false;
  private isKingMoved = false;
  private isCheck = false;
  private bindedPieces: RegularPiece<T>[] = [];

  move(cell: { cellToMoveId: number; cell: T }, callback?: Function) {
    super.move(cell, callback);

    const { cellToMoveId } = cell;
    const startingPosition = this.getId();
    const color = this.getColor();
    if (startingPosition + 2 === cellToMoveId) {
      const shift = color === 'w' ? 3 : 4;
      const rook = this.pieces.getPieceById(startingPosition + shift);
      const cellRef = this.globalGameState.getCellRefById(
        startingPosition + 1
      )!.cellRef;
      // rook?.move({ cellToMoveId: startingPosition + 1, cell: cellRef });
    }

    if (startingPosition - 2 === cellToMoveId) {
      const shift = color === 'w' ? 4 : 3;
      const rook = this.pieces.getPieceById(startingPosition - shift);
      const cellRef = this.globalGameState.getCellRefById(
        startingPosition - 1
      )!.cellRef;
      // rook?.move({ cellToMoveId: startingPosition - 1, cell: cellRef });
    }
  }

  setCheck() {
    this.isCheck = true;
  }

  clearCheckState() {
    this.isCheck = false;
  }

  checkRanges() {
    const color = this.getColor();
    const opponentColor = color === 'w' ? 'b' : 'w';
    const ranges = this.pieces.getAllRangesByColor(opponentColor);
    const currPos = this.getCurrentPosition();

    const attackingRanges = ranges.filter((range) => ~range.indexOf(currPos));

    attackingRanges.forEach((range) => {
      const selfIndex = range.indexOf(currPos);
      const newRange = [...range].splice(0, selfIndex);

      const piecesBetween = newRange
        .map((pos) => this.pieces.getPieceByPosition(pos))
        .filter((c) => c && c.getColor() === color);

      if (piecesBetween.length !== 1) {
        return;
      }
      if (piecesBetween[0] && piecesBetween[0] instanceof Rook) {
        // (<Rook<T>>piecesBetween[0]).updateRange(range[0]);
        (<Rook<T>>(<unknown>piecesBetween[0])!).bindToKing(range);
        // this.pieces.calcPath();
      }
      this.bindedPieces.push(<RegularPiece<T>>(<unknown>piecesBetween[0]));
    });
  }

  calculateAvailableCels() {
    this.checkRanges();
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const color = this.getColor();
    const opponentColor = color === 'w' ? 'b' : 'w';
    const opponentPaths =
      this.pieces.getAllAttackingCellsByColor(opponentColor);

    if (~opponentPaths.indexOf(curr)) {
      this.isCheck = true;
    }

    const newCoordinates = [
      new Position(coordinates).verticalShift(1).getPostition(),
      new Position(coordinates)
        .verticalShift(1)
        .horizontalShift(1)
        .getPostition(),
      new Position(coordinates)
        .verticalShift(1)
        .horizontalShift(-1)
        .getPostition(),
      new Position(coordinates).verticalShift(-1).getPostition(),
      new Position(coordinates)
        .verticalShift(-1)
        .horizontalShift(1)
        .getPostition(),
      new Position(coordinates)
        .verticalShift(-1)
        .horizontalShift(-1)
        .getPostition(),
      new Position(coordinates).horizontalShift(1).getPostition(),
      new Position(coordinates).horizontalShift(-1).getPostition(),
    ];

    newCoordinates.forEach((coord) => {
      if (!coord) {
        return;
      }

      const pos = getPositionByCoordinates(coord);
      const piece = this.pieces.getPieceByPosition(pos);
    });

    const kingStartingPosition = this.getColor() === 'w' ? 4 : 59;

    if (
      !this.hasCastled &&
      !this.isKingMoved &&
      this.getCurrentPosition() === kingStartingPosition
    ) {
      if (this.castleShort()) {
        newCoordinates.push(
          new Position(coordinates).horizontalShift(2).getPostition()
        );
      }
      if (this.castleLong()) {
        newCoordinates.push(
          new Position(coordinates).horizontalShift(-2).getPostition()
        );
      }
    }

    const filteredCoordinates = <[number, number][]>newCoordinates.filter(
      (c) => {
        if (c === null) {
          return null;
        }

        const position = getPositionByCoordinates(c);
        const piece = this.pieces.getPieceByPosition(position);
        if (piece?.getColor() === this.getColor()) {
          return null;
        } else {
          return c;
        }
      }
    );

    const positions = filteredCoordinates.map((c) =>
      getPositionByCoordinates(c)
    );
    if (this.isCheck) {
      this.availableCellsToMove = positions.filter(
        (c) => !~opponentPaths.indexOf(c)
      );
    } else {
      this.availableCellsToMove = positions;
    }
  }

  castleShort() {
    // @TODO move to pieces store
    return;

    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const color = this.getColor();
    const d = color === 'w' ? 1 : -1;
    const firstPieceCoordinates = new Position(coordinates)
      .horizontalShift(d)
      .getPostition()!;
    const secondPieceCoordinates = new Position(coordinates)
      .horizontalShift(d * 2)
      .getPostition()!;
    const thirdPieceCoordinates = new Position(coordinates)
      .horizontalShift(d * 3)
      .getPostition()!;

    const firstPiecePosition = getPositionByCoordinates(firstPieceCoordinates);
    const secondPiecePosition = getPositionByCoordinates(
      secondPieceCoordinates
    );
    const rookPosition = getPositionByCoordinates(thirdPieceCoordinates);

    const firstPiece = this.pieces.getPieceByPosition(firstPiecePosition);
    const secondPiece = this.pieces.getPieceByPosition(secondPiecePosition);
    const rook = this.pieces.getPieceByPosition(rookPosition);

    if (!firstPiece && !secondPiece && rook) {
      return true;
    }

    return false;
  }

  castleLong() {
    // @TODO move to pieces store
    return;

    const position = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(position);
    const color = this.getColor();
    const d = color === 'w' ? -1 : 1;
    const firstPieceCoordinates = new Position(coordinates)
      .horizontalShift(d)
      .getPostition()!;
    const secondPieceCoordinates = new Position(coordinates)
      .horizontalShift(d * 2)
      .getPostition()!;
    const thirdPieceCoordinates = new Position(coordinates)
      .horizontalShift(d * 3)
      .getPostition()!;
    const fourthPieceCoordinates = new Position(coordinates)
      .horizontalShift(d * 3)
      .getPostition()!;

    const firstPiecePosition = getPositionByCoordinates(firstPieceCoordinates);
    const secondPiecePosition = getPositionByCoordinates(
      secondPieceCoordinates
    );
    const thirdPiecePosition = getPositionByCoordinates(thirdPieceCoordinates);
    const rookPosition = getPositionByCoordinates(fourthPieceCoordinates);

    const firstPiece = this.pieces.getPieceByPosition(firstPiecePosition);
    const secondPiece = this.pieces.getPieceByPosition(secondPiecePosition);
    const thirdPiece = this.pieces.getPieceByPosition(thirdPiecePosition);
    const rook = this.pieces.getPieceByPosition(rookPosition);

    if (!firstPiece && !secondPiece && !thirdPiece && rook) {
      return true;
    }

    return false;
  }
}

export default King;
