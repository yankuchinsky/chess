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
      : e.target.parentElement.id.split("_")[1];
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
    const board = globalGameState.getBoard();
    const availableCells = pieceElement.getAvailableCells();
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
    
    const coord = board.getCoordinates(pieceElement.getId());
    if (!coord) {
      return;
    }

    pieceElement?.calculateAvailableCels(coord);
    const availableCells = pieceElement.getAvailableCells().filter(cell => {
      const boardCell = board.getCellById(cell);
      const boardPiece = boardCell?.piece;
      if (boardPiece && boardPiece.getColor() === pieceElement.getColor()) {
        return null;
      }

      return cell;
    });
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
