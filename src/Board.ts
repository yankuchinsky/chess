import { DEV_MODE } from "./index";

export const SIZE = 8;

type BoardMapCell = {
  cellRef: HTMLDivElement,
}

class Board {
  private boardMap: BoardMapCell[][] = [];

  constructor(element: HTMLDivElement, size: number) {
    let isBlack = false;
    let idx = size * size;
    let fileIdx = 0;

    this.boardMap = Array.from(new Array(size), () => []);

    for (let i = 0; i < size; i ++) {
      for (let j = 0; j < size; j ++) {
        idx -= 1;
        const currentFileIdx = idx - size + j * 2 + 1;
        const currentFileBoardMapIdx = size - fileIdx - 1;
        const cellElement = this.createCellElement(currentFileIdx, isBlack ? "black" : "white");

        this.boardMap[currentFileBoardMapIdx][j] = { cellRef: cellElement };

        isBlack = !isBlack;
        element.appendChild(cellElement);
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

  getFlatBoard() {
    return this.boardMap.flat();
  }
}

export default Board;