import HtmlGameState from './HtmlGameState';
import { getCoordinatesByPosition } from '../../packages/chess-engine/helpers';

let tmpCells: number[] = [];
let tmpAttackCells: number[] = [];


export const initHandlers = (globalGameState: HtmlGameState) => {
  const handleDrop = (e: any) => {
    e.target.style.opacity = 1;
    e.stopPropagation();
    const pieces = globalGameState.getPieces();
    const movePlace = e.target.id.split("_")[0];
    const movePiecePosition =
      movePlace === "cell"
        ? +e.target.id.split("_")[1]
        : +e.target.parentElement.id.split("_")[1];
    const pieceInfo = JSON.parse(e.dataTransfer.getData("text/plain"));
    const currentPiecePosition = +pieceInfo.position;
    const piece = pieces.getPieceByPosition(currentPiecePosition)!;
    const pieceColor = piece.getColor();
    globalGameState.showBoardPath(tmpCells, true);
    globalGameState.showBoardPath(tmpAttackCells, true, true);

    if (currentPiecePosition === movePiecePosition) {
      return;
    }
  
    const isWhiteMove = globalGameState.getIsWhiteMove();
  
    if (isWhiteMove) {
      if (pieceColor !== "w") return;
    } else {
      if (pieceColor !== "b") return;
    }
  
    const afterMove = () => {
      globalGameState.addMove(`${piece.getType()}_${piece.getId()}_${currentPiecePosition}_${movePiecePosition}`);
      globalGameState.changeTheTurn();
    }
  
    globalGameState.move(currentPiecePosition, movePiecePosition, afterMove);
  
    return false;
  };
  
  const handleDragEnd = (e: any) => {
    e.target.style.opacity = 1;
  };
  
  const handleDragStart = (e: any) => {
    const pieceId = e.target.id;
    const position = e.target.parentElement.id.split("_")[1];
    const pieceIdx = pieceId.split("_")[1];
    const pieces = globalGameState.getPieces();
  
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
  
      tmpCells = pieceElement.getAvailableCells();
      tmpAttackCells = pieceElement.getCellsToCapture();
      globalGameState.showBoardPath(tmpCells);
      globalGameState.showBoardPath(tmpAttackCells, false, true);
    }
  
    e.target.style.opacity = 0.1;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(pieceObject));
  };
  
  const handleDragOver = (e: any) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
  
    return false;
  };
  
  return { handleDrop, handleDragStart, handleDragOver, handleDragEnd };
}