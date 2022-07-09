import Board from "./Board";
import Piece from "./pieces/Piece";

interface IGameState {
  board: Board | undefined,
  isWhiteMove: boolean;
  whiteCapturedPieces: string[];
  blackCapturedPieces: string[];
  whitePieces: TPiece[];
  blackPieces: TPiece[];
  whiteState: any;
  blackState: any;
  currentPiece: any;
}

export const state: IGameState = {
  board: undefined,
  isWhiteMove: true,
  whiteCapturedPieces: [],
  blackCapturedPieces: [],
  whitePieces: [],
  blackPieces: [],
  whiteState: undefined,
  blackState: undefined,
  currentPiece: undefined,
};

class GameState {
  private board: Board;
  private isWhiteMove = true;
  private whiteCapturedPieces: Piece[] = [];
  private blackCapturedPieces: Piece[] = [];

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
}

export default GameState;
