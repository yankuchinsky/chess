import {
  checkIsDifferentFiles,
  isVacantCell,
  absVerticalShift,
  isOnFirstFile,
  isOnLastFile,
  isCellCanBeAttacked,
} from "./helpers";

import { SIZE } from "./field";

interface IGameState {
  boardMap: TCell[];
  isWhiteMove: boolean;
  whiteCapturedPieces: string[];
  blackCapturedPieces: string[];
  whitePieces: TPiece[];
  blackPieces: TPiece[];
  whiteState: any;
  blackState: any;
}

export const state: IGameState = {
  boardMap: [],
  isWhiteMove: true,
  whiteCapturedPieces: [],
  blackCapturedPieces: [],
  whitePieces: [],
  blackPieces: [],
  whiteState: undefined,
  blackState: undefined,
};

// cells under control

export const calculateCellsUnderControl = (color: "w" | "b") => {
  const obj = color === "w" ? "whitePieces" : "blackPieces";

  // state[obj] = state[obj]
};

export const caculateCellsToAttack = (color: "w" | "b") => {
  const obj = color === "w" ? "whitePieces" : "blackPieces";

  // state[obj] = state[obj]
};

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
          isVacantCell(position, newPos) &&
          absVerticalShift(position, newPos) < 3
        ) {
          piece.availableCells.push(newPos);
        }
      });
    }

    if (pieceType === "p") {
      const colorModifier = color === "w" ? 1 : -1;
      piece.availableCells.push(position + colorModifier * SIZE);

      const lastOrFirstFileCheck = color === "w" ? isOnFirstFile : isOnLastFile;

      if (lastOrFirstFileCheck(position)) {
        piece.availableCells.push(position + colorModifier * SIZE * 2);
      }

      const left = position + colorModifier * SIZE - 1;
      const right = position + colorModifier * SIZE + 1;

      if (
        state.boardMap[left] &&
        isCellCanBeAttacked(position, left) &&
        absVerticalShift(position, left) === 1
      ) {
        piece.availableCells.push(left);
      }

      if (
        state.boardMap[right] &&
        isCellCanBeAttacked(position, right) &&
        absVerticalShift(position, right) === 1
      ) {
        piece.availableCells.push(right);
      }
    }
  }
};

export const turn = () => {
  caculateCellsToMove(state.isWhiteMove ? "w" : "b");
};

export const changeTheTurn = () => {
  state.isWhiteMove = !state.isWhiteMove;
  turn();
  console.log("current move is", state.isWhiteMove ? "white" : "black");
};

export const setPiece = (position: number, piece: string | 0) => {
  state.boardMap[position].piece = piece;
};

export const changePiecePosition = (prev: number, curr: number) => {
  const prevCell = state.boardMap[prev];
  const piece = prevCell.cellRef.children[0];
  const currCell = state.boardMap[curr];

  const pieceId = piece.id.split("_")[0];

  const obj = state.isWhiteMove ? "whitePieces" : "blackPieces";

  const pieceInArray = state[obj].find((p) => p.cellId === prev);

  setPiece(curr, pieceId);
  setPiece(prev, 0);

  currCell.cellRef.appendChild(piece);
  if (!pieceInArray) {
    return;
  }

  pieceInArray.cellId = curr;
};
