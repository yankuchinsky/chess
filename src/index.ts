import "./style.css";
import GameState from './HtmlGameState';
import Pieces from './Pieces';
import {
  handleDrop,
  handleDragStart,
  handleDragOver,
  handleDragEnd
} from "./handlers"; 
import jsonSetup from './templates/standart.json';
import test from './templates/test.json'
import GameRenderer from './pieces/GameRenderer'

export const DEV_MODE = true;
export const SIZE = 8;

const body = document.querySelector("body");

const field = document.createElement("div");
field.className = "field";

const renderer = new GameRenderer();

export const globalGameState = new GameState(field);
globalGameState.setupPiecesPositionsByJSON(test);

globalGameState.init();

body?.appendChild(field);

field.addEventListener("dragstart", handleDragStart);
field.addEventListener("dragend", handleDragEnd);
field.addEventListener("drop", handleDrop);
field.addEventListener("dragover", handleDragOver);
