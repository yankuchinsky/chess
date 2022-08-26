import { SIZE } from "../index";
import { ChessEngine, Pieces, PieceRenderer } from "chess-engine";
import HtmlPieceRenderer from './HtmlPieceRenderer';
import HtmlBoard from "./HtmlBoard";

class HtmlChessEngine extends ChessEngine<HTMLDivElement> {
  constructor(field: HTMLDivElement) {
    super();

    this.board = new HtmlBoard(field, SIZE);
    this.pieces = new Pieces<HTMLDivElement>(<PieceRenderer<HTMLDivElement>>new HtmlPieceRenderer());
  }
}

export default HtmlChessEngine;