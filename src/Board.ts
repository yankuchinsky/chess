import { DEV_MODE } from "./index";
import Piece from './pieces/Piece';

export const SIZE = 8;

type BoardMapCell = TCell & {
  cellPiece: Piece | undefined;
}

type newBoardMapCell = {
  cellRef: HTMLDivElement,
  piece: Piece | undefined,
}

class Board {
  private boardMap: BoardMapCell[] = [];
  private newBoardMap: newBoardMapCell[][] = [];
  private files: number[][] = [];

  constructor(element: HTMLDivElement, size: number) {
    let isBlack = false;
    let idx = size * size;
    let regularId = 0;
    let fileIdx = 0;

    this.newBoardMap = Array.from(new Array(size), () => []);

    for (let i = 0; i < size; i ++) {
      for (let j = 0; j < size; j ++) {
        idx -= 1;
        const currentFileIdx = idx - size + j * 2 + 1;
        const currentFileBoardMapIdx = size - fileIdx - 1;
        const cellElement = this.createCellElement(currentFileIdx, isBlack ? "black" : "white");

        this.newBoardMap[currentFileBoardMapIdx][j] = {
          cellRef: cellElement,
          piece: undefined,
        };

        isBlack = !isBlack;
        element.appendChild(cellElement);
        regularId += 1;
      }
      isBlack = !isBlack;
      fileIdx += 1;
    }
  };

  createCellElement(id: number, color: "white" | "black") {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell_${id}`;

    if (DEV_MODE) {
      cell.innerHTML = `${id}`;
    }

    if (color === "black") {
      cell.classList.add("cell-black");
    } else {
      cell.classList.add("cell-white");
    }

    return cell;
  };

  renderPieceToCell(piece: Piece, id: number) {
    const cellRef = this.getCellRef(id);

    if (cellRef) {
      cellRef.appendChild(piece.getElement());
    }
  };

  getCellRef(id: number) {
    return this.getCellById(id)?.cellRef;
  };

  getCellById(id: number) {
    const boardMap = this.getFlatBoard();

    if (!boardMap[id]) {
      return;
    }

    return boardMap[id];
  }

  showPath(cells: number[], clear = false) {
    const boardMap = this.getFlatBoard(); 
    cells.forEach(cell => {
      if (clear) {
        boardMap[cell].cellRef.classList.remove('path');
      } else {
        boardMap[cell].cellRef.classList.add('path');
      }
    });
  }

  getFiles() {
    return this.files;
  }

  getBoardMap() {
    return this.boardMap;
  };

  getPieceByPosition(position: number) {
    const piece = this.getFlatBoard().find(cell => {
      return cell.piece?.getCurrentPosition() === position;
    })

    return piece?.piece;
  };

  getFlatBoard() {
    return this.newBoardMap.flat();
  }
}

export default Board;