import { SIZE } from '../index';
import { ChessEngine, BasePiecesStore } from 'chess-engine';
import HtmlPieceRenderer from './HtmlPieceRenderer';
import HtmlBoard from './HtmlBoard';
import HtmlPiece from './HtmlPiece';

class HtmlChessEngine extends ChessEngine<HTMLDivElement> {
  private pieceRenderer: HtmlPieceRenderer;
  private pieces: HtmlPiece<HTMLDivElement>[] = [];

  constructor(field: HTMLDivElement) {
    super();

    this.board = new HtmlBoard(SIZE, field);
    this.piecesStore = new BasePiecesStore<HTMLDivElement>(this);
    this.pieceRenderer = new HtmlPieceRenderer();
  }

  renderPieces() {
    const pieces = this.piecesStore.getAllPieces();

    pieces.forEach(piece => {
      const p = this.pieceRenderer.createRenderElement(piece.getId(), piece.getType());
      const cell = this.board.getCellRef(piece.getId());
      if (!cell) {
        return;
      }
      const htmlPiece = new HtmlPiece(cell, piece);
      htmlPiece.setElement(p);
      this.pieceRenderer.render(htmlPiece);

      this.pieces.push(htmlPiece);
    });
  }
}

export default HtmlChessEngine;
