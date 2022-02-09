import { state, initBoard } from "./gameState";
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

initBoard();

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

    const piece = document.createElement("div");
    piece.classList.add("piece");

    if (isDevMode) {
      piece.classList.add("piece_dev_mode");
    }

    const createPiece = (id: number, type: string, img: string) => {
      piece.style.backgroundImage = `url(${img})`;
      piece.id = `${type}_${id}`;
      state.boardMap[id - 1] = type;
    };

    if (currentDiagonal === 7) {
      if (currentId === 56 || currentId === 63) {
        createPiece(currentId, "br", blackRook);
      }

      if (currentId === 57 || currentId === 62) {
        createPiece(currentId, "bn", blackKnight);
      }

      if (currentId === 58 || currentId === 61) {
        createPiece(currentId, "bb", blackBishop);
      }

      if (currentId === 59) {
        createPiece(currentId, "bk", blackKing);
      }

      if (currentId === 60) {
        createPiece(currentId, "bq", blackQueen);
      }

      cell.appendChild(piece);
    }

    if (currentDiagonal === 6) {
      createPiece(currentId, "bp", blackPawn);
      cell.appendChild(piece);
    }

    if (currentDiagonal === 1) {
      createPiece(currentId, "wp", whitePawn);
      cell.appendChild(piece);
    }

    if (currentDiagonal === 0) {
      if (currentId === 0 || currentId === 7) {
        createPiece(currentId, "wr", whiteRook);
      }

      if (currentId === 1 || currentId === 6) {
        createPiece(currentId, "wn", whiteKnight);
      }

      if (currentId === 2 || currentId === 5) {
        createPiece(currentId, "wb", whiteBishop);
      }

      if (currentId === 3) {
        createPiece(currentId, "wq", whiteQueen);
      }

      if (currentId === 4) {
        createPiece(currentId, "wk", whiteKing);
      }

      cell.appendChild(piece);
    }

    piece.style.backgroundSize = "contain";
    piece.draggable = true;

    piece.addEventListener("dragstart", handleDragStart);
    piece.addEventListener("dragend", handleDragEnd);
    cell.addEventListener("drop", handleDrop);
    cell.addEventListener("dragover", handleDragOver);

    if (isBlack) {
      cell.classList.add("cell-black");

      isBlack = false;
    } else {
      cell.classList.add("cell-white");
      isBlack = true;
    }

    element.appendChild(cell);
  }
};
