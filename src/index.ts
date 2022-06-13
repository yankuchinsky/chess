import "./style.css";
import { generateField } from "./field";
import Board from "./Board";
import {
  handleDrop,
  handleDragEnd,
  handleDragStart,
  handleDragOver,
} from "./handlers";

export const DEV_MODE = true;

const bootstrap = () => {
  const body = document.querySelector("body");
  if (!body) {
    return;
  }

  const field = document.createElement("div");
  field.className = "field";
  const board = new Board(field, 8);

  body.appendChild(field);

  field.addEventListener("dragstart", handleDragStart);
  field.addEventListener("dragend", handleDragEnd);
  field.addEventListener("drop", (e) => handleDrop(e, board));
  field.addEventListener("dragover", handleDragOver);
};

bootstrap();
