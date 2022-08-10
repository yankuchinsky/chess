import PieceRenderer from "./pieces/PieceRenderer";
import Piece from './pieces/Piece';

export class HtmlPieceRenderer extends PieceRenderer<HTMLDivElement> {
  render(piece: Piece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.appendChild(piece.getElement());
  }

  remove(piece: Piece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.removeChild(piece.getElement());
  }

  returnNewRenderer(): PieceRenderer<HTMLDivElement> {
    return new HtmlPieceRenderer();
  }
}

export default HtmlPieceRenderer;