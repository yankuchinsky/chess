import { AbstractBoard, BasePiecesStore, type TColor } from 'chess-engine';
import { type VNode, reactive, ref } from 'vue';
import type { VueCell } from '@/types';

class VueBoard extends AbstractBoard<VNode> {
  private piecesStore: BasePiecesStore<VNode>;
  cells: VueCell[][];

  constructor(store: BasePiecesStore<VNode>) {
    super();
    this.piecesStore = store;

    const size = 8;
    const cells: VueCell[][] = reactive(Array.from(new Array(size), () => []));

    let isBlack = false;
    let idx = size * size;
    let fileIdx = 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        idx -= 1;

        const currentFileIdx = idx - size + j * 2 + 1;
        const currentFileBoardMapIdx = size - fileIdx - 1;

        const x = currentFileBoardMapIdx;
        const y = j;
        const piece = this.piecesStore.getPieceByPosition(currentFileIdx);
        cells[x][y] = {
          cellRef: ref(null),
          id: currentFileIdx,
          color: <TColor>(isBlack ? 'black' : 'white'),
          piece,
        };

        isBlack = !isBlack;
      }
      isBlack = !isBlack;
      fileIdx += 1;
    }

    this.cells = cells;
  }

  showPath(cells: number[], clear: boolean) {
    this.cells.flat().forEach(cell => ~cells.indexOf(cell.id) && (cell.path = clear));
  };
}

export default VueBoard;