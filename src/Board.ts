import { DEV_MODE, globalGameState } from "./index";
import Piece from "./Piece";
import { PieceType } from './helpers'
import PieceFactory from './PieceFactory'

export const SIZE = 8;

type BoardMapCell = TCell & {
  cellPiece: Piece | undefined;
}

type newBoardMapCell = {
  cellRef: HTMLElement,
  piece: Piece | undefined,
}

class Board {
  private boardMap: BoardMapCell[] = [];
  private newBoardMap: newBoardMapCell[][] = [];
  private files: number[][] = [];
  private whitePieces: Piece[] = [];
  private blackPieces: Piece[] = [];

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
        const piece = this.createPiece(currentFileIdx, currentFileBoardMapIdx);

        this.newBoardMap[currentFileBoardMapIdx][j] = {
          cellRef: cellElement,
          piece: undefined,
        };

        if (piece) {
          this.newBoardMap[currentFileBoardMapIdx][j] = {
            cellRef: cellElement,
            piece,
          };

          this.newBoardMap[currentFileBoardMapIdx][j].cellRef.appendChild(piece.getElement());
        }

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

  createPiece(currentId: number, currentFile: number) {
    if (currentFile === 7) {
      if (currentId === 56 || currentId === 63) {
        return PieceFactory.createPiece(currentId, PieceType.BR);
      }
  
      if (currentId === 57 || currentId === 62) {
        return PieceFactory.createPiece(currentId, PieceType.BN);
      }
  
      if (currentId === 58 || currentId === 61) {
        return PieceFactory.createPiece(currentId, PieceType.BB);
      }
  
      if (currentId === 59) {
        return PieceFactory.createPiece(currentId, PieceType.BK);
      }
  
      if (currentId === 60) {
        return PieceFactory.createPiece(currentId, PieceType.BQ);
      }
    }
  
    if (currentFile === 6) {
      return PieceFactory.createPiece(currentId, PieceType.BP);
    }
  
    if (currentFile === 1) {
      return PieceFactory.createPiece(currentId, PieceType.WP);
    }
  
    if (currentFile === 0) {
      if (currentId === 0 || currentId === 7) {
        return PieceFactory.createPiece(currentId, PieceType.WR);
      }
  
      if (currentId === 1 || currentId === 6) {
        return PieceFactory.createPiece(currentId, PieceType.WN);
      }
  
      if (currentId === 2 || currentId === 5) {
        return PieceFactory.createPiece(currentId, PieceType.WB);
      }
  
      if (currentId === 3) {
        return PieceFactory.createPiece(currentId, PieceType.WQ);
      }
  
      if (currentId === 4) {
        return PieceFactory.createPiece(currentId, PieceType.WK);
      }
    }

    return undefined;
  }

  renderPieceToCell(piece: Piece, id: number) {
    const cellRef = this.getCellRef(id);

    if (cellRef) {
      cellRef.appendChild(piece.getElement());
    }
  };

  getCellRef(id: number) {
    if (!this.boardMap[id]) {
      return;
    }

    return this.boardMap[id].cellRef
  };

  showPath(cells: number[], clear = false) {
    cells.forEach(cell => {
      if (clear) {
        this.boardMap[cell].cellRef.classList.remove('path');
      } else {
        this.boardMap[cell].cellRef.classList.add('path');
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
    const piece = this.boardMap.find(cell => {
      return cell.cellPiece?.getCurrentPosition() === position;
    })

    return piece?.cellPiece;
  };

  getPieceById(id: number) {
    const piece = this.boardMap.find(cell => {
      return cell.cellPiece?.getId() === id;
    })

    return piece?.cellPiece;
  }

  movePiece(curr: number, prev: number) {
    const piece = this.getPieceByPosition(prev);
    if (this.isVacantCell(curr, prev) && piece?.isCanBeMoved(curr)) {
      this.changePiecePosition(curr, prev);
      globalGameState.changeTheTurn();
    }
  }

  isVacantCell = (curr: number, prev: number) => {
    const boardMap = this.getFlatBoard()
    if (!boardMap[curr].piece) {
      return true;
    }

    const currentColor = boardMap[prev].piece?.toString().split("")[0];
    const movePieceColor = boardMap[curr].piece?.toString().split("")[0];
  
    if (currentColor !== movePieceColor) {
      return true;
    }
  
    return false;
  };

  changePiecePosition(curr: number, prev: number) {
    const prevCell = this.boardMap[prev];
    if (!prevCell) {
      return;
    }
    const piece = prevCell.cellRef.children[0];
    const currCell = this.boardMap[curr];

    if (!currCell) {
      return;
    }

    const pieceId = piece.id.split("_")[0];

    const obj = globalGameState.getIsWhiteMove() ? "whitePieces" : "blackPieces";

    const pieceInArray = this[obj].find((p) => p.getId() === prev);

    this.boardMap[curr].piece = pieceId;
    this.boardMap[prev].piece = 0;

    currCell.cellRef.appendChild(piece);
    if (!pieceInArray) {
      return;
    }

    pieceInArray.setCurrentPosition(curr);
  }

  getFlatBoard() {
    return this.newBoardMap.flat();
  }

  deletePiece(position: number) {
    //
  }
}

export default Board;