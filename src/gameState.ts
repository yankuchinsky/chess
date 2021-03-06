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
}

export default GameState;
