import { DEV_MODE, globalGameState } from "../index";
import { DefaultRenderer } from "./PieceRenderer";

const getImage = (type: string) => {
  return require(`../assets/${type}.png`).default;
}
abstract class Piece {
  private element: HTMLDivElement;
  private color: TColor;
  private id: number;
  private type: string;
  private pieceType: string;
  private currentPosition: number;
  private renderer: DefaultRenderer;
  protected availableCellsToMove: number[] = [];
  protected pieces = globalGameState.getPieces();

  constructor(id: number, type: string, currentCell: HTMLDivElement, renderer: DefaultRenderer) {
    this.element = document.createElement("div");
    if (DEV_MODE) {
      this.element.classList.add("piece_dev_mode");
    }
    this.type = type;
    this.pieceType = type.split('')[1];
    this.element.classList.add("piece");
    this.element.style.backgroundImage = `url(${getImage(type)})`;
    this.element.id = `${type}_${id}`;
    this.id = id;
    this.currentPosition = id;
    this.element.style.backgroundSize = "contain";
    this.element.draggable = true;
    this.color = <TColor>type.split("")[0];
    this.renderer = renderer;
    this.renderer.setCurrentCell(currentCell);
  };

  abstract calculateAvailableCels();

  getId() {
    return this.id;
  }

  setId(id: number) {
    this.id = id;
  }

  getColor() {
    return this.color;
  }

  getElement() {
    return this.element;
  }

  getType() {
    return this.type;
  }

  getPiecetype() {
    return this.pieceType;
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  render() {
    this.renderer.render(this.getElement());
  }

  setCurrentPosition(position: number) {
    this.currentPosition = position;
  }

  clearAvailableCells() {
    this.availableCellsToMove = [];
  }

  getAvailableCells() {
    return this.availableCellsToMove;
  }
  
  setCellElement(cell: HTMLDivElement) {
    this.renderer.setCurrentCell(cell);
  }

  remove() {
    this.renderer.remove(this.element);
  }

  move({ cellToMoveId, cell }: { cellToMoveId: number, cell: HTMLDivElement }, callback?: Function) {
    this.setCellElement(cell);
    this.setCurrentPosition(cellToMoveId);
    this.render();

    if (callback) {
      callback();
    }
  }
}

export default Piece;