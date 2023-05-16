import ChessEngine from '../ChessEngine';
import Pieces from './Pieces';
import PieceRenderer from '../renderers/PieceRenderer';
import AbstractPiece from './AbstractPiece';

type TColor = 'w' | 'b';

class RenderablePiece<T> {
  private element: T;
  private currentCell: T;
  private renderer: PieceRenderer<T>;
  private piece: AbstractPiece<T>;

  constructor(currentCell: T, piece: AbstractPiece<T>) {
    this.currentCell = currentCell;
    this.piece = piece;
  }

  init() {
    this.element = this.renderer.createRenderElement(this.piece.getId(), this.piece.getType());
  }

  calculateAvailableCels() {
    this.piece.calculateAvailableCels();
  };

  calculateCellsToCapture() {
    this.piece.calculateCellsToCapture();
  }

  getCurrentCell() {
    return this.currentCell;
  }

  getColor() {
    return this.piece.getColor();
  }

  getType() {
    return this.piece.getType();
  }

  getPiece() {
    return this.piece;
  }

  getPiecetype() {
    return this.piece.getPiecetype();
  }

  getCurrentPosition() {
    return this.piece.getCurrentPosition();
  }

  getElement() {
    return this.element;
  }

  getId() {
    return this.piece.getId();
  }

  clearAvailableCells() {
    this.piece.clearAvailableCells();
  }

  getAvailableCells() {
    return this.piece.getAvailableCells();
  }

  getCellsToCapture() {
    return this.piece.getCellsToCapture();
  }

  setPiecesRef(pieces: Pieces<T>) {
    this.piece.setPiecesRef(pieces);
  }

  setGameState(gameState: ChessEngine<T>) {
    this.piece.setGameState(gameState);
  }

  render() {
    this.renderer.render(this);
  }

  setRenderer(renderer: PieceRenderer<T>) {
    this.renderer = renderer;
  }

  setCellElement(cell: T) {
    this.currentCell = cell;
  }

  remove() {
    this.renderer.remove(this);
  }

  move(
    { cellToMoveId, cell }: { cellToMoveId: number; cell: T },
    callback?: Function
  ) {
    this.setCellElement(cell);
    this.piece.setCurrentPosition(cellToMoveId);
    this.render();

    if (callback) {
      callback();
    }
  }
}

export default RenderablePiece;
