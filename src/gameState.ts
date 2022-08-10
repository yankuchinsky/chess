import { SIZE } from "./index";
import Board from "./HtmlBoard";
import Piece from "./pieces/Piece";
import Pieces from "./Pieces";

class GameState<TRenderer> {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];
  private pieces: Pieces<TRenderer>;
  private moves: string[] = [];
  private board: Board;

  constructor(field: HTMLDivElement) {
    this.board = new Board(field, SIZE);
    this.pieces = new Pieces();
  }
  
  init() {
    this.calcPath();
  }

  setupPiecesPositionsByJSON(positions: JSON) {
    this.pieces.setupPiecesByJSON(positions, this.board);
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
