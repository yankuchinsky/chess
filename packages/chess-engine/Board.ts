import AbstractBoard from './AbstractBoard';

export const SIZE = 8;

type BoardMapCell<TCellRef> = {
  cellRef: TCellRef;
};

abstract class Board<T> extends AbstractBoard<T> {
  protected boardMap: BoardMapCell<T>[][] = [];
  protected rootElement: T;
  protected size: number;

  constructor(size: number, element?: T) {
    super();

    if (element) {
      this.rootElement = element;
    }
    this.size = size;
    this.boardMap = Array.from(new Array(size), () => []);

    this.renderBoard();
  }

  loopThrough(action: Function) {
    let isBlack = false;
    let idx = this.size * this.size;
    let fileIdx = 0;

    this.boardMap = Array.from(new Array(this.size), () => []);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        idx -= 1;

        const currentFileIdx = idx - this.size + j * 2 + 1;
        const currentFileBoardMapIdx = this.size - fileIdx - 1;
        action(currentFileIdx, currentFileBoardMapIdx, j, isBlack);

        isBlack = !isBlack;
      }
      isBlack = !isBlack;
      fileIdx += 1;
    }
  }

  protected abstract renderBoard();

  protected abstract createCellElement(id: number, color: 'white' | 'black');

  getCellRef(id: number) {
    return this.getCellById(id)?.cellRef;
  }

  getCellById(id: number) {
    const boardMap = this.getFlatBoard();

    if (!boardMap[id]) {
      return;
    }

    return boardMap[id];
  }

  abstract showPath(cells: number[], clear);
  abstract showAttackPath(cells: number[], clear);

  getFlatBoard() {
    return this.boardMap.flat();
  }
}

export default Board;
