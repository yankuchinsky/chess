import { Board } from 'chess-engine';
import { DEV_MODE } from '../index';

class HtmlBoard extends Board<HTMLDivElement> {
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