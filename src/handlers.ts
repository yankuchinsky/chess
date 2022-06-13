import Board from "./Board";
import { SIZE } from "./field";
import {
  state,
  changeTheTurn,
  setPiece,
  changePiecePosition,
} from "./gameState";
import {
  deletePiece,
} from "./helpers";

export const handleDrop = (e: any, board: Board) => {
  e.stopPropagation();

  const movePlace = e.target.id.split("_")[0];
  const currentCellId =
    movePlace === "cell"
      ? e.target.id.split("_")[1]
      : e.path[1].id.split("_")[1];
  const pieceInfo = JSON.parse(e.dataTransfer.getData("text/plain"));
  const transferId = pieceInfo.piece;
  const piecePrevPosition = pieceInfo.position;
  const [pieceTypeInfo, pieceCurrentPosition] = transferId.split("_");
  const pieceType = pieceTypeInfo.split("")[1];
  const pieceColor = pieceTypeInfo.split("")[0];

  if (+piecePrevPosition === +currentCellId) {
    return;
  }

  if (state.isWhiteMove) {
    if (pieceColor !== "w") return;
  } else {
    if (pieceColor !== "b") return;
  }

  if (e.target.id.split("_")[0].split("")[0] === pieceColor) {
    return;
  }

  const knightAttack = (prevPosition: number, moveCell: number) => {
    setPiece(prevPosition, 0);

    if (!state.boardMap[moveCell]) {
      return false;
    }

    deletePiece(moveCell);
    move();

    return true;
  };

  const pawnAttack = (
    prevPosition: number,
    moveCell: number,
    piece: string
  ) => {
    const pieceColor = piece.split("")[0];
    const m = pieceColor === "w" ? SIZE : -SIZE;
    const left = prevPosition + m - 1;
    const right = prevPosition + m + 1;
    const leftPiece = state.boardMap[left];
    const rightPiece = state.boardMap[right];

    if (left === moveCell && leftPiece) {
      setPiece(prevPosition, 0);
      deletePiece(moveCell);
      move();

      return true;
    }

    if (right === moveCell && rightPiece) {
      setPiece(prevPosition, 0);
      deletePiece(moveCell);
      move();

      return true;
    }

    return false;
  };

  const move = () => {
    changePiecePosition(+piecePrevPosition, +currentCellId);
    changeTheTurn();
  };
  board.movePiece(+currentCellId, +piecePrevPosition);

  return false;
};

export const handleDragEnd = (e: any) => {
  e.target.style.opacity = 1;
};

export const handleDragStart = (e: any) => {
  const piece = e.target.id;
  const position = piece.split("_")[1];

  const pieceObject = {
    piece,
    position,
  };

  e.target.style.opacity = 0.1;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", JSON.stringify(pieceObject));

  state.currentPiece = pieceObject;
};

export const handleDragOver = (e: any) => {
  if (e.preventDefault) {
    e.preventDefault();
  }

  state.currentPiece = null;

  return false;
};
