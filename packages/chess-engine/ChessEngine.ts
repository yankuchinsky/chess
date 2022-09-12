import Board from "./Board";
import Piece from "./pieces/Piece";
import Pieces from "./pieces/Pieces";
import { 
  getPositionByCoordinates, 
  getLeftDiagonalRange, 
  getRightDiagonalRange,
  getHorizontalRange,
  getVerticalRange,
} from './helpers'

abstract class ChessEngine<T> {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece<T>[] = [];
  private blackCapturedPieces: Piece<T>[] = [];
  protected pieces: Pieces<T>;
  private moves: string[] = [];
  protected board: Board<T>;

  init() {
    this.calcPath();
  }

  setupPiecesPositionsByJSON(positions: JSON) {
    this.pieces.setupPiecesByJSON(positions, this.board, this);
  }

  changeTheTurn() {
    const callback = () => {
      //
    }

    this.calcPath(); 
    
    this.isWhiteMove = !this.isWhiteMove;    
  }


  calcPath() {
    if (this.isWhiteMove) {
      this.pieces.calcPath(false);
      this.pieces.calcPath();
      this.pieces.calcKingPath(false);
      this.pieces.calcKingPath()
    } else {
      this.pieces.calcPath();
      this.pieces.calcPath(false);
      this.pieces.calcKingPath()
      this.pieces.calcKingPath(false);
    }
  }
  
  getIsWhiteMove() {
    return this.isWhiteMove;
  }

  getBoard() {
    return this.board;
  }

  getPieces() {
    return this.pieces;
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

  showBoardPath(cells: number[], clearFlag?: boolean, isAttack: boolean = false) {
    if (isAttack) {
      this.board.showAttackPath(cells, clearFlag);
    } else {
      this.board.showPath(cells, clearFlag);
    }
  }

  addMove(move: string) {
    this.moves.push(move);
  }

  getLastMoveAndRemove() {
    return this.moves.pop();
  }

  getMoves() {
    return this.moves;
  }

  move(currCell: number, cellToMoveId: number, onCompleteMove: Function) {
    const cell = this.board.getCellById(cellToMoveId)!.cellRef;
    this.pieces.move(currCell, cellToMoveId, cell, onCompleteMove);
  }

  filterPath(range: [number, number][], pieceColor: 'w' | 'b') {
    const arrayForResults: [number, number][] = [];
    
    for (let i = 0; i < range.length; i++) {
      const c = range[i];
      const position = getPositionByCoordinates(c);
      const pieces = this.getPieces();
      const blockerPositionPiece = pieces.getPieceByPosition(position);
      
      if (!blockerPositionPiece) {
        arrayForResults.push(c);
      } else if(blockerPositionPiece.getColor() !== pieceColor) {
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

    const leftRange = getLeftDiagonalRange(coordinates).filter(c => !!c);
    const rightRange = getRightDiagonalRange(coordinates).filter(c => !!c);
  
    const idxLeft = leftRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
    const idxRight = rightRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
  
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
    ranges.forEach(range => filteredRanges.push(...this.filterPath(range, pieceColor)));

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
  
    const idxHorizontal = horizontalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
    const idxVertical = verticalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
  
    const rRange = horizontalRange.slice(idxHorizontal + 1, horizontalRange.length);
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
    ranges.forEach(range => filteredRanges.push(...this.filterPath(range, pieceColor)));

    return filteredRanges;
  }
  
}

export default ChessEngine;
