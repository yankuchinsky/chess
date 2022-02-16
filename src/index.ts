import "./style.css";
import { generateField } from "./field";

export const DEV_MODE = true;

const bootstrap = () => {
  const body = document.querySelector("body");
  if (!body) {
    return;
  }

  const field = document.createElement("div");
  field.className = "field";

  generateField(field);

  body.appendChild(field);
};

bootstrap();
