import Board from "./Board";
import Piece from "./pieces/Piece";
import Player from "./Player";

class GameState {
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];
  private moves: string[] = [];

  constructor(private board: Board, private white: Player, private black: Player) {
  }

  getGameState() {
    return this;
  }

  changeTheTurn() {

    if (this.isWhiteMove) {
      this.white.calcPath();
      this.black.calcPath();
    } else {
      this.black.calcPath();
      this.white.calcPath();
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
