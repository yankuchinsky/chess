import { defineStore } from 'pinia';
import { reactive, Ref, ref, VNode } from 'vue';

export const useBoardStore = defineStore('board', () => {
  const size = 8;
  const cells: any[][] = reactive(Array.from(new Array(size), () => []));

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

      cells[x][y] = { cellRef: ref(null), id: currentFileIdx, color: isBlack ? 'black' : 'white'  };

      isBlack = !isBlack;
    }
    isBlack = !isBlack;
    fileIdx += 1;
  }

  const setRefToCell = (id: number, elRef: Ref) => {
    const flatBoard = cells.flat();
    // console.log(flatBoard.map(el => el.id));
    const found = flatBoard.find(el => el.id === id);
    found.cellRef = ref(elRef);
  }

  return { board: cells, setRefToCell }
});