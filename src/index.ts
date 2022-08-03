import "./style.css";
import GameState from './GameState'
import Board from "./Board";
import Pieces from './Pieces';
import Player from './Player';
import {
  handleDrop,
  handleDragStart,
  handleDragOver,
  handleDragEnd
} from "./handlers";
import Game from './Game';
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


export const game = new Game(pieces);
playerBlack.calcPath(() => {});
playerWhite.calcPath(() => {});


console.log('board', playerWhite);
body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", handleDrop);
field.addEventListener("dragover", handleDragOver);
