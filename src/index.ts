import "./style.css";
import GameState from './gameState'
import Board from "./Board";
import Pieces from './Pieces';
import Player from './Player';
import {
  handleDrop,
  handleDragStart,
  handleDragOver,
  handleDragEnd
} from "./handlers";
import jsonSetup from './templates/standart.json';
import test from './templates/test.json'


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
pieces.setupPiecesByJSON(test);

playerWhite.setPieces(pieces.getAllPiecesByColor('w'));
playerBlack.setPieces(pieces.getAllPiecesByColor('b'));
playerBlack.calcPath();
playerWhite.calcPath();


console.log('board', pieces);
body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", handleDrop);
field.addEventListener("dragover", handleDragOver);
