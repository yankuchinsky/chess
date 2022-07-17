import Board from "./Board";
import { globalGameState, pieces } from "./index";
import { getCoordinatesByPosition } from './helpers';

export const handleDrop = (e: any) => {
  e.stopPropagation();

  const movePlace = e.target.id.split("_")[0];
  const movePiecePosition =
    movePlace === "cell"
      ? +e.target.id.split("_")[1]
      : +e.target.parentElement.id.split("_")[1];
  const pieceInfo = JSON.parse(e.dataTransfer.getData("text/plain"));
  const currentPiecePosition = +pieceInfo.position;
  const piece = pieces.getPieceByPosition(currentPiecePosition)!;
  const pieceColor = piece.getColor();
  const board = globalGameState.getBoard();

  if (currentPiecePosition === movePiecePosition) {
    return;
  }
  const gameState = globalGameState.getGameState();
  const isWhiteMove = gameState.getIsWhiteMove();

  if (isWhiteMove) {
    if (pieceColor !== "w") return;
  } else {
    if (pieceColor !== "b") return;
  }

  const afterMove = () => {
    const availableCells = piece.getAvailableCells();
    board.showPath(availableCells, true);
  }

  pieces.move(currentPiecePosition, movePiecePosition, afterMove);

  return false;
};

export const handleDragEnd = (e: any) => {
  e.target.style.opacity = 1;
  const piece = e.target.id;
  const pieceId = +piece.split("_")[1];
  const pieceElement = pieces.getPieceById(pieceId);

  if (pieceElement) {
    const board = globalGameState.getBoard();
    const availableCells = pieceElement.getAvailableCells();
    board.showPath(availableCells, true);
    pieceElement.clearAvailableCells();
  }
};

export const handleDragStart = (e: any) => {
  const board = globalGameState.getBoard()
  const pieceId = e.target.id;
  const position = e.target.parentElement.id.split("_")[1];
  const pieceIdx = pieceId.split("_")[1];

  const pieceObject = {
    pieceId,
    position,
  };

  const pieceElement = pieces.getPieceById(+pieceIdx);
  if (pieceElement) {
    
    const coord = getCoordinatesByPosition(pieceElement.getId());
    if (!coord) {
      return;
    }

    const availableCells = pieceElement.getAvailableCells();
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

  return false;
};
