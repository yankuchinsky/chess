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
import jsonSetup from './templates/standart.json';
import test from './templates/test.json'


export const DEV_MODE = true;
export const SIZE = 8;

const body = document.querySelector("body");

const field = document.createElement("div");
field.className = "field";

const playerWhite = new Player('w');
const playerBlack = new Player('w');
export const pieces = new Pieces();
export const globalGameState = new GameState(field, playerWhite, playerBlack, pieces);

pieces.setupPiecesByJSON(test, globalGameState.getBoard());

globalGameState.init();

playerBlack.calcPath(() => {});
playerWhite.calcPath(() => {});


console.log('board', playerWhite);
body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", handleDrop);
field.addEventListener("dragover", handleDragOver);
