import style from "./style.css";
import GameState from "./components/HtmlGameState";
import { initHandlers } from "./components/handlers";
import jsonSetup from "../templates/standart";

export const DEV_MODE = true;
export const SIZE = 8;

class HtmlChess extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    console.log("style", style);
    const divElement = document.createElement("div");
    divElement.innerHTML = '<style>@import "styles.css";' + style + "</style>";
    shadow.appendChild(divElement);
    const filed = bootstrap(jsonSetup);

    shadow.appendChild(filed);
  }
}

window.customElements.define("html-chess", HtmlChess);

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

  return field;
};

export default { bootstrap, HtmlChess };
