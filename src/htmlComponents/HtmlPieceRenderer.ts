import PieceRenderer from "../renderers/PieceRenderer";
import Piece from '../pieces/Piece';
import { DEV_MODE } from "../index";

const getImage = (type: string) => {
  return require(`../assets/${type}.png`).default;
}

export class HtmlPieceRenderer extends PieceRenderer<HTMLDivElement> {
  render(piece: Piece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.appendChild(piece.getElement());
  }

  remove(piece: Piece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.removeChild(piece.getElement());
  }

  returnNewRenderer(): PieceRenderer<HTMLDivElement> {
    return new HtmlPieceRenderer();
  }

  createRenderElement(id: number, type: string): HTMLDivElement {
    const element = document.createElement("div");
    if (DEV_MODE) {
      element.classList.add("piece_dev_mode");
    }

    element.classList.add("piece");
    element.style.backgroundImage = `url(${getImage(type)})`;
    element.id = `${type}_${id}`;
    element.style.backgroundSize = "contain";
    element.draggable = true;

    return element;
  }
}

export default HtmlPieceRenderer;