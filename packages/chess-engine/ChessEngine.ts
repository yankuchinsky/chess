import Board from './Board';
import Piece from './pieces/AbstractPiece';
import BasePiecesStore from './pieces/PiecesStore/BasePiecesStore';
import Move from './Move';
import PiecesController from './PiecesController';
import {
  getPositionByCoordinates,
  getLeftDiagonalRange,
  getRightDiagonalRange,
  getHorizontalRange,
  getVerticalRange,
} from './helpers';

abstract class ChessEngine<T> {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece<T>[] = [];
  private blackCapturedPieces: Piece<T>[] = [];
  protected piecesStore: BasePiecesStore<T>;
  private moves: Move<T>[] = [];
  private piecesController: PiecesController;
  protected board: Board<T>;
  private isCalculationDisabled = true;

  init() {
    this.calcPath();
  }

  toggleCalculation(value: boolean) {
    this.isCalculationDisabled = value;

    if (value) {
      this.clearPath();
    } else {
      this.calcPath();
    }

  }

  getCalculationDisabledStatus() {
    return this.isCalculationDisabled;
  }

  setPiecesStore (store: BasePiecesStore<T>) {
    this.piecesStore = store;
  }

  setupPiecesPositionsByJSON(positions: JSON) {
    this.piecesStore.setupPiecesByJSON(positions);
  }

  changeTheTurn() {
    const callback = () => {
      //
    };

    this.calcPath();

    this.isWhiteMove = !this.isWhiteMove;
  }

  clearPath() {
    this.piecesStore.clearPathCells(true);
    this.piecesStore.clearPathCells(false);
  }

  calcPath() {
    if (this.isCalculationDisabled) {
      return;
    }

    if (this.isWhiteMove) {
      this.piecesStore.calcPath(false);
      this.piecesStore.calcPath();
      this.piecesStore.calcKingPath(false);
      this.piecesStore.calcKingPath();
    } else {
      this.piecesStore.calcPath();
      this.piecesStore.calcPath(false);
      this.piecesStore.calcKingPath();
      this.piecesStore.calcKingPath(false);
    }
  }

  getIsWhiteMove() {
    return this.isWhiteMove;
  }

  getBoard() {
    return this.board;
  }

  getPieces() {
    return this.piecesStore;
  }

  capture(piece: Piece<T>) {
    if (piece.getColor() === 'w') {
      this.whiteCapturedPieces.push(piece);
    } else {
      this.blackCapturedPieces.push(piece);
    }
  }

  getCellRefById(id: number) {
    return this.board.getCellById(id);
  }

  showBoardPath(
    cells: number[],
    clearFlag?: boolean,
    isAttack: boolean = false
  ) {
    if (isAttack) {
      this.board.showAttackPath(cells, clearFlag);
    } else {
      this.board.showPath(cells, clearFlag);
    }
  }

  addMove(piece: Piece<T>, prev: number, curr: number) {
    this.moves.push(new Move(piece, prev, curr));
  }

  getLastMoveAndRemove() {
    return this.moves.pop();
  }

  getMoves() {
    return this.moves;
  }

  move(currCell: number, cellToMoveId: number, onCompleteMove: Function) {
    this.piecesStore.move(currCell, cellToMoveId, onCompleteMove);
  }

  filterPath(range: [number, number][], pieceColor: 'w' | 'b') {
    const arrayForResults: [number, number][] = [];

    for (let i = 0; i < range.length; i++) {
      const c = range[i];
      const position = getPositionByCoordinates(c);
      const pieces = this.getPieces();
      const blockerPositionPiece: Piece<T> = <Piece<T>>(
        (<any>pieces.getPieceByPosition(position))
      );

      if (!blockerPositionPiece) {
        arrayForResults.push(c);
      } else if (
        blockerPositionPiece.getColor() !== pieceColor &&
        blockerPositionPiece.getPiecetype() !== 'k'
      ) {
        arrayForResults.push(c);
        break;
      } else {
        break;
      }
    }

    return arrayForResults;
  }

  calculateDiagonalRanges(coordinates: [number, number]) {
    const piecePosition = getPositionByCoordinates(coordinates);
    const pieces = this.getPieces();
    const piece = pieces.getPieceByPosition(piecePosition);

    if (!piece) {
      return [];
    }

    const leftRange = getLeftDiagonalRange(coordinates).filter((c) => !!c);
    const rightRange = getRightDiagonalRange(coordinates).filter((c) => !!c);

    const idxLeft = leftRange.findIndex(
      (c) => c[0] === coordinates[0] && c[1] === coordinates[1]
    );
    const idxRight = rightRange.findIndex(
      (c) => c[0] === coordinates[0] && c[1] === coordinates[1]
    );

    const tlRange = leftRange.slice(idxLeft + 1, leftRange.length);
    const trRange = rightRange.slice(idxRight + 1, rightRange.length);
    const brRange = leftRange.slice(0, idxLeft).reverse();
    const blRange = rightRange.slice(0, idxRight).reverse();

    return [tlRange, trRange, brRange, blRange];
  }

  calculateDiagonalAvailableCells(coordinates: [number, number]) {
    const piecePosition = getPositionByCoordinates(coordinates);
    const pieces = this.getPieces();
    const piece = pieces.getPieceByPosition(piecePosition);

    if (!piece) {
      return [];
    }

    const pieceColor = piece?.getColor();
    const ranges = this.calculateDiagonalRanges(coordinates);
    const filteredRanges: [number, number][] = [];
    ranges.forEach((range) =>
      filteredRanges.push(...this.filterPath(range, pieceColor))
    );

    return filteredRanges;
  }

  calcVerticalRanges(coordinates: [number, number]) {
    const piecePosition = getPositionByCoordinates(coordinates);
    const pieces = this.getPieces();
    const piece = pieces.getPieceByPosition(piecePosition);

    if (!piece) {
      return [];
    }
    const horizontalRange = getHorizontalRange(coordinates);
    const verticalRange = getVerticalRange(coordinates);
    const idxHorizontal = horizontalRange.findIndex(
      (c) => c[0] === coordinates[0] && c[1] === coordinates[1]
    );
    const idxVertical = verticalRange.findIndex(
      (c) => c[0] === coordinates[0] && c[1] === coordinates[1]
    );

    const rRange = horizontalRange.slice(
      idxHorizontal + 1,
      horizontalRange.length
    );
    const tRange = verticalRange.slice(idxVertical + 1, verticalRange.length);
    const lRange = horizontalRange.slice(0, idxHorizontal).reverse();
    const bRange = verticalRange.slice(0, idxVertical).reverse();

    return [rRange, tRange, lRange, bRange];
  }

  calculateVerticalAvailableCells(coordinates: [number, number]) {
    const piecePosition = getPositionByCoordinates(coordinates);
    const pieces = this.getPieces();
    const piece = pieces.getPieceByPosition(piecePosition);

    if (!piece) {
      return [];
    }

    const pieceColor = piece?.getColor();
    const ranges = this.calcVerticalRanges(coordinates);
    const filteredRanges: [number, number][] = [];
    ranges.forEach((range) =>
      filteredRanges.push(...this.filterPath(range, pieceColor))
    );

    return filteredRanges;
  }
}

export default ChessEngine;
