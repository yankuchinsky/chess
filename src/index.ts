import "./style.css";
import { generateField } from "./field";

const DEV_MODE = true;

const bootstrap = () => {
  const body = document.querySelector("body");
  if (!body) {
    return;
  }

  const field = document.createElement("div");
  field.className = "field";

  generateField(field, DEV_MODE);

  body.appendChild(field);
};

bootstrap();
