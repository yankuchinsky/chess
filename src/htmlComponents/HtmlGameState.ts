import { SIZE } from "../index";
import GameState from "../GameState";
import Pieces from "../pieces/Pieces";
import HtmlPieceRenderer from './HtmlPieceRenderer';
import HtmlBoard from "./HtmlBoard";

class HtmlGameState extends GameState<HTMLDivElement> {
  constructor(field: HTMLDivElement) {
    super();

    this.board = new HtmlBoard(field, SIZE);
    this.pieces = new Pieces<HTMLDivElement>(new HtmlPieceRenderer());
  }
}

export default HtmlGameState;