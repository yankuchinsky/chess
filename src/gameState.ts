import {
  checkIsDifferentFiles,
  isVacantCell,
  absVerticalShift,
  isCellCanBeAttacked,
} from "./helpers";
import { SIZE } from './index'

import Board from "./Board";
import Piece from "./Piece";

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

export const caculateCellsToMove = (color: "w" | "b") => {
  const obj = color === "w" ? "whitePieces" : "blackPieces";
  for (let piece of state[obj]) {
    const pieceType = piece.type.split("")[1];
    const position = piece.cellId;
    piece.availableCells = [];

    if (pieceType === "n") {
      [6, 10, 15, 17, -6, -10, -15, -17].forEach((m) => {
        const newPos = position + m;
        if (
          newPos >= 0 &&
          newPos < 64 &&
          checkIsDifferentFiles(position, newPos) &&
          isVacantCell(position, newPos)
          // absVerticalShift(position, newPos) < 3
        ) {
          piece.availableCells.push(newPos);
        }
      });
    }

    if (pieceType === "p") {
      const colorModifier = color === "w" ? 1 : -1;
      piece.availableCells.push(position + colorModifier * SIZE);

      // const lastOrFirstFileCheck = color === "w" ? isOnFirstFile : isOnLastFile;

      // if (lastOrFirstFileCheck(position)) {
      //   piece.availableCells.push(position + colorModifier * SIZE * 2);
      // }

      const left = position + colorModifier * SIZE - 1;
      const right = position + colorModifier * SIZE + 1;

      // if (
      //   state.boardMap[left] &&
      //   isCellCanBeAttacked(position, left) &&
      //   absVerticalShift(position, left) === 1
      // ) {
      //   piece.availableCells.push(left);
      // }

      // if (
      //   state.boardMap[right] &&
      //   isCellCanBeAttacked(position, right) &&
      //   absVerticalShift(position, right) === 1
      // ) {
      //   piece.availableCells.push(right);
      // }
    }

    if (pieceType === "b") {

      let isCellOccupied = false;

      while (isCellOccupied) {
        // const left = position + colorModifier * SIZE - 1;
      }
    }
  }
};
