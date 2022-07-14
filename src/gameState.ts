import Board from "./Board";
import Piece from "./pieces/Piece";

class GameState {
  private board: Board;
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];
  private moves: string[] = [];

  constructor(board: Board) {
    this.board = board;
  }

  getGameState() {
    return this;
  }

  changeTheTurn() {
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

  addMove(move: string) {
    this.moves.push(move);
  }

  getLastMoveAndRemove() {
    return this.moves.pop();
  }

  getMoves() {
    return this.moves;
  }
}

export default GameState;
