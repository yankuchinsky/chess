type BoardMapCell<TCellRef> = {
  cellRef: TCellRef
}

abstract class AbstractBoard<T> {
  protected boardMap: BoardMapCell<T>[][] = [];

  constructor(boardMap, element?: T) {
    this.boardMap = boardMap;
  };

  getCellRef(id: number) {
    return this.getCellById(id)?.cellRef;
  };

  getCellById(id: number) {
    const boardMap = this.getFlatBoard();

    if (!boardMap[id]) {
      return;
    }

    return boardMap[id];
  }

  getFlatBoard() {
    return this.boardMap.flat();
  }
}

export default AbstractBoard;