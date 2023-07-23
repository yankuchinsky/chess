import { reactive, Ref, ref, VNode } from 'vue';
import { defineStore } from 'pinia';
import standart from '../templates/standart.json';
import { BasePiecesStore } from 'chess-engine';
import VueChessEngine from '@/src/helpers/VueChess';

const setupBoard = <T>(pieces: BasePiecesStore<T>) => {
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
      const piece = pieces.getPieceByPosition(currentFileIdx);
      cells[x][y] = {
        cellRef: ref(null),
        id: currentFileIdx,
        color: isBlack ? 'black' : 'white',
        piece,
      };

      isBlack = !isBlack;
    }
    isBlack = !isBlack;
    fileIdx += 1;
  }

  return cells;
}

export const useBoardStore = defineStore('board', () => {
  const chessEngine = new VueChessEngine();
  const pieces = new BasePiecesStore<VNode>(chessEngine);
  chessEngine.setPiecesStore(pieces);
  const pieceToMove = ref(0);
  pieces.setupPiecesByJSON(standart);

  pieces.calcPath();
  
  const cells = setupBoard(pieces);

  const move = (currCell: number, cellToMoveId: number) => {
    const x1 = Math.floor(currCell / 8);
    const y1 = currCell % 8;
    const x2 = Math.floor(cellToMoveId / 8);
    const y2 = cellToMoveId % 8;

    pieces.move(currCell, cellToMoveId, () => {
      const piece = cells[x1][y1].piece;
      cells[x1][y1].piece = undefined;
      cells[x2][y2].piece = piece;
    });
  };
  
  const dragStart = (pieceId: number) => {
    pieceToMove.value = pieceId;
  };
  
  const dragEnd = () => {
    pieceToMove.value = 0;
  };
  

  return { board: cells, move, dragStart, dragEnd, pieceToMove };
});
