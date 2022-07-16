import "./style.css";
import GameState from './gameState'
import Board from "./Board";
import Pieces from './Pieces';
import Player from './Player';
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
const playerWhite = new Player('w');
const playerBlack = new Player('w');
export const globalGameState = new GameState(board, playerWhite, playerBlack);

export const pieces = new Pieces(board, globalGameState);
pieces.setupPiecesByJSON(jsonSetup);

playerWhite.setPieces(pieces.getAllPiecesByColor('w'));
playerBlack.setPieces(pieces.getAllPiecesByColor('b'));

playerWhite.calcPath();


console.log('board', pieces);
body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", (e) => handleDrop(e, board));
field.addEventListener("dragover", handleDragOver);
