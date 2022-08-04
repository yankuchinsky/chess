import { SIZE } from "./index";
import Board from "./Board";
import Piece from "./pieces/Piece";
import Player from "./Player";
import Pieces from "./Pieces";

class GameState {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];
  private pieces: Pieces;
  private white: Player; 
  private black: Player;
  private moves: string[] = [];
  private board: Board;

  constructor(field: HTMLDivElement) {
    this.board = new Board(field, SIZE);
    this.pieces = new Pieces();
  }
  
  init() {
    this.white = new Player('w', this.pieces.getAllPiecesByColor('w'));
    this.black = new Player('w', this.pieces.getAllPiecesByColor('b'));

    this.black.calcPath(() => {});
    this.white.calcPath(() => {});
  }

  setupPiecesPositionsByJSON(positions: JSON) {
    this.pieces.setupPiecesByJSON(positions, this.board);
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

  getPieces() {
    return this.pieces;
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
