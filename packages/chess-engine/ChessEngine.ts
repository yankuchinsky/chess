import Board from "./Board";
import Piece from "./pieces/Piece";
import Pieces from "./pieces/Pieces";

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

  showBoardPath(cells: number[], clearFlag?: boolean) {
    this.board.showPath(cells, clearFlag);
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
}

export default ChessEngine;
