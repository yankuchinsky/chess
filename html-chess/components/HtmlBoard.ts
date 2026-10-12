import { AbstractBoard } from 'chess-engine';
import { DEV_MODE } from '../index';

class HtmlBoard extends AbstractBoard<HTMLDivElement> {
  protected rootElement: HTMLDivElement;

  constructor(size: number, element?: HTMLDivElement) {
    super();

    if (element) {
      this.rootElement = element;
    }
    this.size = size;
    this.boardMap = Array.from(new Array(size), () => []);

    this.renderBoard();
  }
  
  renderBoard() {
    this.loopThrough((absIdx, x, y, isBlack) => {
      const cellElement = this.createCellElement(absIdx, isBlack ? "black" : "white");
      this.boardMap[x][y] = { cellRef: cellElement };
      this.rootElement.appendChild(this.boardMap[x][y].cellRef);
    });
  }

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

  private loopThrough(action: Function) {
    let isBlack = false;
    let idx = this.size * this.size;
    let fileIdx = 0;

    this.boardMap = Array.from(new Array(this.size), () => []);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        idx -= 1;

        const currentFileIdx = idx - this.size + j * 2 + 1;
        const currentFileBoardMapIdx = this.size - fileIdx - 1;
        action(currentFileIdx, currentFileBoardMapIdx, j, isBlack);

        isBlack = !isBlack;
      }
      isBlack = !isBlack;
      fileIdx += 1;
    }
  }

  private addClassToAllCells(cells: number[], className: string, clear = false) {
    const boardMap = this.getFlatBoard(); 
    cells.forEach(cell => {
      if (clear) {
        boardMap[cell].cellRef.classList.remove(className);
      } else {
        boardMap[cell].cellRef.classList.add(className);
      }
    });
  } 

  showPath(cells: number[], clear = false) {
    this.addClassToAllCells(cells, 'path', clear);
  }

  showAttackPath(cells: number[], clear = false) {
    this.addClassToAllCells(cells, 'attack', clear);
  }
}

export default HtmlBoard;