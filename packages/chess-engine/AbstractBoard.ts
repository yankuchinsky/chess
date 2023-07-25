type BoardMapCell<TCellRef> = {
  cellRef: TCellRef
}

abstract class AbstractBoard<T> {
  protected boardMap: BoardMapCell<T>[][] = [];

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