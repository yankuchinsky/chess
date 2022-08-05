type TRenderer = HTMLDivElement;

export default abstract class PieceRenderer<T> {
  protected currentCell: T;
  protected abstract render(element: T);
  protected abstract remove(element: TRenderer);
  getCurrentCell() {
    return this.currentCell;
  }
  setCurrentCell(cell: T) {
    this.currentCell = cell;
  }
}

export class DefaultRenderer extends PieceRenderer<TRenderer> {
  render(element: TRenderer) {
    this.currentCell.appendChild(element);
  }

  remove(element: TRenderer) {
    this.currentCell.removeChild(element);
  }
}