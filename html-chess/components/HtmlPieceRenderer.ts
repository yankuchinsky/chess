// import { PieceRenderer } from 'chess-engine';
import { DEV_MODE } from '../index';
import HtmlPiece from './HtmlPiece'
import getImage from '../../assets/imageLoader';

export class HtmlPieceRenderer {
  render(piece: HtmlPiece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.appendChild(piece.getElement());
  }

  remove(piece: HtmlPiece<HTMLDivElement>) {
    const cell = piece.getCurrentCell();
    cell.removeChild(piece.getElement());
  }

  createRenderElement(id: number, type: string): HTMLDivElement {
    const element = document.createElement('div');
    if (DEV_MODE) {
      element.classList.add('piece_dev_mode');
    }

    element.classList.add('piece');
    element.style.backgroundImage = `url(${getImage(type)})`;
    element.id = `${type}_${id}`;
    element.style.backgroundSize = 'contain';
    element.draggable = true;

    return element;
  }
}

export default HtmlPieceRenderer;
