import { SIZE } from "./field";
import { state, changeTheTurn } from "./gameState";
import {
  isVacantCell,
  deletePiece,
  rookMoveCheck,
  bishopMoveCheck,
  canMoveToLastCell,
} from "./helpers";

export const handleDrop = (e: any) => {
  e.stopPropagation();

  const movePlace = e.target.id.split("_")[0];
  const currentCellId =
    movePlace === "cell"
      ? e.target.id.split("_")[1]
      : e.path[1].id.split("_")[1];
  const currentMoveSellElement = movePlace === "cell" ? e.target : e.path[1];
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
    state.boardMap[prevPosition] = 0;

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
      state.boardMap[prevPosition] = 0;
      deletePiece(moveCell);
      move();

      return true;
    }

    if (right === moveCell && rightPiece) {
      state.boardMap[prevPosition] = 0;
      deletePiece(moveCell);
      move();

      return true;
    }

    return false;
  };

  const movePiece = () => {
    console.log("board", state.boardMap);
    console.log(
      "pieces",
      piecePrevPosition,
      currentCellId,
      state.boardMap[currentCellId]
    );
    if (!isVacantCell(currentCellId, piecePrevPosition)) {
      return;
    }

    move();
  };

  const move = () => {
    const element = document.querySelector(`#${transferId}`);
    currentMoveSellElement.appendChild(element);

    state.boardMap[piecePrevPosition] = 0;
    state.boardMap[currentCellId] = pieceTypeInfo;
    changeTheTurn();
  };

  // rook move
  if (pieceType === "r") {
    if (rookMoveCheck(+currentCellId, +piecePrevPosition)) {
      movePiece();
    }
  }

  // bishop move
  if (pieceType === "b") {
    if (bishopMoveCheck(+currentCellId, +piecePrevPosition)) {
      movePiece();
    }
  }

  // queen move
  if (pieceType === "q") {
    if (
      rookMoveCheck(+currentCellId, +piecePrevPosition) ||
      bishopMoveCheck(+currentCellId, +piecePrevPosition)
    ) {
      movePiece();
    }
  }

  if (pieceType === "n") {
    const diff = Math.abs(currentCellId - piecePrevPosition);

    if (diff === 6 || diff === 10 || diff === 15 || diff === 17) {
      if (knightAttack(+piecePrevPosition, +currentCellId)) {
        return false;
      }

      movePiece();
    }
  }

  if (pieceType === "k") {
    const diff = Math.abs(currentCellId - piecePrevPosition);

    if (diff < 10) {
      canMoveToLastCell(+currentCellId, +piecePrevPosition);
      movePiece();
    }
  }

  // pawn move
  if (pieceType === "p") {
    if (pawnAttack(+piecePrevPosition, +currentCellId, pieceTypeInfo)) {
      return false;
    }

    if (pieceColor === "w") {
      if (
        +currentCellId - 2 * SIZE === +piecePrevPosition &&
        +piecePrevPosition < 16
      ) {
        movePiece();
      }

      if (+currentCellId - SIZE === +piecePrevPosition) {
        movePiece();
      }
    }

    if (pieceColor === "b") {
      if (
        +currentCellId + 2 * SIZE === +piecePrevPosition &&
        piecePrevPosition > 46
      ) {
        movePiece();
      }

      if (+currentCellId + SIZE === +piecePrevPosition) {
        movePiece();
      }
    }
  }

  return false;
};

export const handleDragEnd = (e: any) => {
  e.target.style.opacity = 1;
};

export const handleDragStart = (e: any) => {
  e.target.style.opacity = 0.1;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData(
    "text/plain",
    JSON.stringify({ piece: e.target.id, position: e.path[1].id.split("_")[1] })
  );
};

export const handleDragOver = (e: any) => {
  if (e.preventDefault) {
    e.preventDefault();
  }

  return false;
};
