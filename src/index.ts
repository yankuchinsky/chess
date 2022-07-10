import "./style.css";
import GameState from './gameState'
import Board from "./Board";
import Pieces from './Pieces';
import {
  handleDrop,
  handleDragEnd,
  handleDragStart,
  handleDragOver,
} from "./handlers";
import jsonSetup from './templates/standart.json';

export const DEV_MODE = true;
export const SIZE = 8;

const body = document.querySelector("body");

const field = document.createElement("div");
field.className = "field";

const board = new Board(field, SIZE);
export const pieces = new Pieces(board);
pieces.setupPiecesByJSON(jsonSetup);
console.log('board', pieces);
export const globalGameState = new GameState(board);

body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", (e) => handleDrop(e, board));
field.addEventListener("dragover", handleDragOver);
