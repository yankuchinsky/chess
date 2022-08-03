import "./style.css";
import GameState from './GameState';
import Pieces from './Pieces';
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

export const pieces = new Pieces();
export const globalGameState = new GameState(field, pieces);

pieces.setupPiecesByJSON(test, globalGameState.getBoard());

globalGameState.init();

body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", handleDrop);
field.addEventListener("dragover", handleDragOver);
