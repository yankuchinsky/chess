import Board from "./Board";
import { SIZE, globalGameState } from "./index";
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
  const gameState = globalGameState.getGameState();
  const isWhiteMove = gameState.getIsWhiteMove();

  if (isWhiteMove) {
    if (pieceColor !== "w") return;
  } else {
    if (pieceColor !== "b") return;
  }

  if (e.target.id.split("_")[0].split("")[0] === pieceColor) {
    return;
  }

  const knightAttack = (prevPosition: number, moveCell: number) => {
    // setPiece(prevPosition, 0);

    // if (!state.boardMap[moveCell]) {
    //   return false;
    // }

    deletePiece(moveCell);

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

    const state = gameState.getGameState()
    const board = state.getBoard();
    const boardMap = board.getBoardMap();

    const leftPiece = boardMap[left];
    const rightPiece = boardMap[right];

    if (left === moveCell && leftPiece) {
      // setPiece(prevPosition, 0);
      deletePiece(moveCell);

      return true;
    }

    if (right === moveCell && rightPiece) {
      // setPiece(prevPosition, 0);
      deletePiece(moveCell);
      return true;
    }

    return false;
  };
  
  board.movePiece(+currentCellId, +piecePrevPosition);

  return false;
};

export const handleDragEnd = (e: any) => {
  e.target.style.opacity = 1;
  const piece = e.target.id;
  const position = piece.split("_")[1];
  const board = globalGameState.getBoard()

  const pieceElement = board.getPieceById(+position);
  if (pieceElement) {
    const availableCells = pieceElement.getAvailableCells();
    const board = globalGameState.getBoard();
    board.showPath(availableCells, true);
    pieceElement.clearAvailableCells();
  }
};

export const handleDragStart = (e: any) => {
  const board = globalGameState.getBoard()
  const piece = e.target.id;
  const position = piece.split("_")[1];

  const pieceObject = {
    piece,
    position,
  };

  const pieceElement = board.getPieceById(+position);
  if (pieceElement) {
    pieceElement?.calculateAvailableCels();

    const availableCells = pieceElement.getAvailableCells();
    const board = globalGameState.getBoard();
    board.showPath(availableCells);
  }

  e.target.style.opacity = 0.1;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", JSON.stringify(pieceObject));
};

export const handleDragOver = (e: any) => {
  if (e.preventDefault) {
    e.preventDefault();
  }

  // state.currentPiece = null;

  return false;
};
