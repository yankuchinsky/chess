import { DEV_MODE } from "./index";
import Piece from "./Piece";
import { state } from './gameState'

import blackBishop from "./assets/bb.png";
import whitePawn from "./assets/wp.png";
import blackPawn from "./assets/bp.png";
import blackRook from "./assets/br.png";
import whiteRook from "./assets/wr.png";
import blackKnight from "./assets/bn.png";
import whiteBishop from "./assets/wb.png";
import whiteKnight from "./assets/wn.png";
import blackQueen from "./assets/bq.png";
import blackKing from "./assets/bk.png";
import whiteQueen from "./assets/wq.png";
import whiteKing from "./assets/wk.png";


export const SIZE = 8;

enum PieceType {
  WP = "wp",
  WN = "wn",
  WB = "wb",
  WK = "wk",
  WQ = "wq",
  WR = "wr",
  BP = "bp",
  BN = "bn",
  BB = "bb",
  BK = "bk",
  BQ = "bq",
  BR = "br",
}

type BoeardMapCell = TCell & {
  cellPiece: Piece | undefined;
}

class Board {
  private boardMap: BoeardMapCell[] = [];
  private files: number[][] = [];
  private whitePieces: Piece[] = [];
  private blackPieces: Piece[] = [];
  constructor(element: HTMLDivElement, size: number) {
    let isBlack = true;
    let span = 7;
    let spanPlus = 0;
    let currentDiagonal = 8;

    for (let i = 0; i < size * size; i++) {
      if (i % 8 === 0) {
        isBlack = !isBlack;
        span = 7;
        spanPlus = 0;
        currentDiagonal -= 1;

        this.files.push([]);
      }

      this.files[this.files.length - 1].push(i);

      const cell = document.createElement("div");
      cell.classList.add("cell");
      const currentId = +(size * size - i - span + spanPlus - 1);
      span -= 1;
      spanPlus += 1;
      cell.id = `cell_${currentId}`;

      if (DEV_MODE) {
        cell.innerHTML = `${currentId}`;
      }

      if (isBlack) {
        cell.classList.add("cell-black");

        isBlack = false;
      } else {
        cell.classList.add("cell-white");
        isBlack = true;
      }

      this.boardMap[currentId] = {
        cellRef: cell,
        piece: 0,
        cellPiece: undefined,
      };

      this.setPieceToBoard(currentId, currentDiagonal);

      element.appendChild(cell);
    }

  };

  setPieceToBoard(currentId: number, currentFile: number) {
    let piece;
    if (currentFile === 7) {
      if (currentId === 56 || currentId === 63) {
        piece = new Piece(currentId, PieceType.BR, blackRook);
      }
  
      if (currentId === 57 || currentId === 62) {
        piece = new Piece(currentId, PieceType.BN, blackKnight);
      }
  
      if (currentId === 58 || currentId === 61) {
        piece = new Piece(currentId, PieceType.BB, blackBishop);
      }
  
      if (currentId === 59) {
        piece = new Piece(currentId, PieceType.BK, blackKing);
      }
  
      if (currentId === 60) {
        piece = new Piece(currentId, PieceType.BQ, blackQueen);
      }
    }
  
    if (currentFile === 6) {
      piece = new Piece(currentId, PieceType.BP, blackPawn);
    }
  
    if (currentFile === 1) {
      piece = new Piece(currentId, PieceType.WP, whitePawn);
    }
  
    if (currentFile === 0) {
      if (currentId === 0 || currentId === 7) {
        piece = new Piece(currentId, PieceType.WR, whiteRook);
      }
  
      if (currentId === 1 || currentId === 6) {
        piece = new Piece(currentId, PieceType.WN, whiteKnight);
      }
  
      if (currentId === 2 || currentId === 5) {
        piece = new Piece(currentId, PieceType.WB, whiteBishop);
      }
  
      if (currentId === 3) {
        piece = new Piece(currentId, PieceType.WQ, whiteQueen);
      }
  
      if (currentId === 4) {
        piece = new Piece(currentId, PieceType.WK, whiteKing);
      }
    }

    if (piece) {
      if (piece.getColor() === "w") {
        this.whitePieces.push(piece);
      } else {
        this.blackPieces.push(piece);
      }

      this.boardMap[currentId].piece = piece.getType();
      this.boardMap[currentId].cellPiece = piece;
      this.renderPieceToCell(piece, currentId);
    }
  };

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


  getBoardMap() {
    return this.boardMap;
  };

  getPieceByPosition(position: number) {
    const piece = this.boardMap.find(cell => {
      return cell.cellPiece?.getCurrentPosition() === position;
    })

    return piece?.cellPiece;
  };

  movePiece(curr: number, prev: number) {
    const piece = this.getPieceByPosition(prev);
    if (this.isVacantCell(curr, prev) && piece?.isCanBeMoved(curr)) {
      this.changePiecePosition(curr, prev);
    }
  }

  isVacantCell = (curr: number, prev: number) => {
    if (!this.boardMap[curr].piece) {
      return true;
    }
  
    const currentColor = this.boardMap[prev].piece.toString().split("")[0];
    const movePieceColor = this.boardMap[curr].piece.toString().split("")[0];
  
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

    const obj = state.isWhiteMove ? "whitePieces" : "blackPieces";

    const pieceInArray = this[obj].find((p) => p.getId() === prev);

    this.boardMap[curr].piece = pieceId;
    this.boardMap[prev].piece = 0;

    currCell.cellRef.appendChild(piece);
    if (!pieceInArray) {
      return;
    }

    pieceInArray.setId(curr);
  }

  deletePiece(position: number) {
    //
  }
}

export default Board;