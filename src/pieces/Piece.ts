import { DEV_MODE, globalGameState } from "../index";
import PieceRenderer from "./PieceRenderer";

const getImage = (type: string) => {
  return require(`../assets/${type}.png`).default;
}
abstract class Piece<T> {
  private element: T;
  private color: TColor;
  private id: number;
  private type: string;
  private pieceType: string;
  private currentPosition: number;
  private currentCell: T;
  private renderer: PieceRenderer<T>;
  protected availableCellsToMove: number[] = [];
  protected pieces = globalGameState.getPieces();

  constructor(id: number, type: string, currentCell: T) {
    
    this.type = type;
    this.pieceType = type.split('')[1];
    this.id = id;
    this.currentPosition = id;
    this.color = <TColor>type.split("")[0];
    this.currentCell = currentCell;
  };

  init() {
    this.element = this.renderer.createRenderElement(this.id, this.type);
  }

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

  getCurrentCell() {
    return this.currentCell;
  }

  render() {
    this.renderer.render(this);
  }

  setRenderer(renderer: PieceRenderer<T>) {
    this.renderer = renderer;
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
  
  setCellElement(cell: T) {
    this.currentCell = cell;
  }

  remove() {
    this.renderer.remove(this);
  }

  move({ cellToMoveId, cell }: { cellToMoveId: number, cell: T }, callback?: Function) {
    this.setCellElement(cell);
    this.setCurrentPosition(cellToMoveId);
    this.render();

    if (callback) {
      callback();
    }
  }
}

export default Piece;