import "./style.css";
import GameState from "./components/HtmlGameState";
import { initHandlers } from "./components/handlers";
import jsonSetup from "../templates/standart";

export const DEV_MODE = true;
export const SIZE = 8;

const bootstrap = (json) => {
  const field = document.createElement("div");
  field.className = "field";

  const globalGameState = new GameState(field);
  globalGameState.setupPiecesPositionsByJSON(json);

  globalGameState.init();

  const { handleDrop, handleDragStart, handleDragOver, handleDragEnd } =
    initHandlers(globalGameState);

  field.addEventListener("dragstart", handleDragStart);
  field.addEventListener("dragend", handleDragEnd);
  field.addEventListener("drop", handleDrop);
  field.addEventListener("dragover", handleDragOver);

  globalGameState.renderPieces();

  return field;
};

export default { bootstrap };
