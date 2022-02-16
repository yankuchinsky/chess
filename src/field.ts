import { DEV_MODE } from "./index";
import { state } from "./gameState";
import {
  handleDrop,
  handleDragEnd,
  handleDragStart,
  handleDragOver,
} from "./handlers";

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

const createPiece = (id: number, type: string, img: string) => {
  const piece = document.createElement("div");

  if (DEV_MODE) {
    piece.classList.add("piece_dev_mode");
  }

  piece.classList.add("piece");
  piece.style.backgroundImage = `url(${img})`;
  piece.id = `${type}_${id}`;
  piece.style.backgroundSize = "contain";
  piece.draggable = true;
  piece.addEventListener("dragstart", handleDragStart);
  piece.addEventListener("dragend", handleDragEnd);

  state.boardMap[id].piece = type;
  state.boardMap[id].cellRef.appendChild(piece);
};

const setPieceToBoard = (currentId: number, currentFile: number): void => {
  if (currentFile === 7) {
    if (currentId === 56 || currentId === 63) {
      createPiece(currentId, PieceType.BR, blackRook);
    }

    if (currentId === 57 || currentId === 62) {
      createPiece(currentId, PieceType.BN, blackKnight);
    }

    if (currentId === 58 || currentId === 61) {
      createPiece(currentId, PieceType.BB, blackBishop);
    }

    if (currentId === 59) {
      createPiece(currentId, PieceType.BK, blackKing);
    }

    if (currentId === 60) {
      createPiece(currentId, PieceType.BQ, blackQueen);
    }
  }

  if (currentFile === 6) {
    createPiece(currentId, PieceType.BP, blackPawn);
  }

  if (currentFile === 1) {
    createPiece(currentId, PieceType.WP, whitePawn);
  }

  if (currentFile === 0) {
    if (currentId === 0 || currentId === 7) {
      createPiece(currentId, PieceType.WR, whiteRook);
    }

    if (currentId === 1 || currentId === 6) {
      createPiece(currentId, PieceType.WN, whiteKnight);
    }

    if (currentId === 2 || currentId === 5) {
      createPiece(currentId, PieceType.WB, whiteBishop);
    }

    if (currentId === 3) {
      createPiece(currentId, PieceType.WQ, whiteQueen);
    }

    if (currentId === 4) {
      createPiece(currentId, PieceType.WK, whiteKing);
    }
  }
};

export const generateField = (
  element: HTMLElement,
  isDevMode: boolean = true
) => {
  let isBlack = true;
  let span = 7;
  let spanPlus = 0;
  let currentDiagonal = 8;

  for (let i = 0; i < SIZE * SIZE; i++) {
    if (i % 8 === 0) {
      isBlack = !isBlack;
      span = 7;
      spanPlus = 0;
      currentDiagonal -= 1;
    }

    const cell = document.createElement("div");
    cell.classList.add("cell");
    const currentId = +(SIZE * SIZE - i - span + spanPlus - 1);
    span -= 1;
    spanPlus += 1;
    cell.id = `cell_${currentId}`;

    if (isDevMode) {
      cell.innerHTML = `${currentId}`;
    }

    cell.addEventListener("drop", handleDrop);
    cell.addEventListener("dragover", handleDragOver);

    if (isBlack) {
      cell.classList.add("cell-black");

      isBlack = false;
    } else {
      cell.classList.add("cell-white");
      isBlack = true;
    }

    state.boardMap[currentId] = {
      cellRef: cell,
      piece: 0,
    };

    setPieceToBoard(currentId, currentDiagonal);

    element.appendChild(cell);
  }
};
