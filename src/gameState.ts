import { SIZE } from "./index";
import Board from "./Board";
import Piece from "./pieces/Piece";
import Player from "./Player";

class GameState {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];
  private moves: string[] = [];
  private board: Board;

  constructor(field: HTMLDivElement, private white: Player, private black: Player, readonly pieces) {
    this.board = new Board(field, SIZE);
  }

  init() {
    this.white.setPieces(this.pieces.getAllPiecesByColor('w'));
    this.black.setPieces(this.pieces.getAllPiecesByColor('b'));
  }

  getGameState() {
    return this;
  }

  changeTheTurn() {
    const callback = () => {
      //
    }

    if (this.isWhiteMove) {
      this.black.calcPath(callback);
      this.white.calcPath(callback);
    } else {
      this.white.calcPath(callback);
      this.black.calcPath(callback);
    }
    
    this.isWhiteMove = !this.isWhiteMove;    
  }

  getIsWhiteMove() {
    return this.isWhiteMove;
  }

  getBoard() {
    return this.board;
  }

  capture(piece: Piece) {
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

export default GameState;
