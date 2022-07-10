import { DEV_MODE } from "../index";
import {
  bishopMoveCheck,
  canMoveToLastCell,
} from "../helpers";

const getImage = (type: string) => {
  return require(`../assets/${type}.png`).default;
}

class Piece {
  private element: HTMLDivElement;
  private color: TColor;
  private id: number;
  private type: string;
  private pieceType: string;
  private currentPosition: number;
  private currentCell: HTMLDivElement;
  protected availableCellsToMove: number[] = [];

  constructor(id: number, type: string, currentCell: HTMLDivElement) {
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
    this.currentCell = currentCell;
  };

  calculateAvailableCels(postion: number[]) {
    //
  }

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

  getCurrentPosition() {
    return this.currentPosition;
  }

  render() {
    this.currentCell.appendChild(this.getElement());
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
  
  // obsolete
  isCanBeMoved (positionToMove: number): boolean {
    const prev = this.currentPosition
    const curr = positionToMove;

    // bishop move
    if (this.pieceType === "b") {
        return true;
    }

    // queen move
    if (this.pieceType === "q") {
      if (
        bishopMoveCheck(curr, prev)
      ) {
        return true;
      }
    }

    if (this.pieceType === "n") {
      const diff = Math.abs(curr - prev);

      if (diff === 6 || diff === 10 || diff === 15 || diff === 17) {
        // if (knightAttack(+curr, +currentCellId)) {
        //   return false;
        // }

        return true;
      }
    }

    if (this.pieceType === "k") {

      const diff = Math.abs(curr - prev);

      if (diff < 10) {
        canMoveToLastCell(curr, prev);
        return true;
      }
    }
    // pawn move
    if (this.pieceType === "p") {
      // if (pawnAttack(+piecePrevPosition, +currentCellId, pieceTypeInfo)) {
      //   return false;
      // }
      if (this.color === "w") {
        if (
          curr - 16 === prev &&
          prev < 16
        ) {
          return true;
        }

        if (curr - 8 === prev) {
          return true;
        }
      }

      if (this.color === "b") {
        if (
          curr + 16 === prev &&
          prev > 46
        ) {
          return true;
        }

        if (curr + 8 === prev) {
          return true;
        }
      }
    }

    return false;
  }
}

export default Piece;