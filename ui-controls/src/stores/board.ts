import { reactive, Ref, ref, VNode } from 'vue';
import { defineStore } from 'pinia';
import standart from '../templates/standart.json';
import { BasePiecesStore } from 'chess-engine';
import VueChessEngine from '@/helpers/VueChess';
import VueBoard from '@/helpers/Board';

export const useBoardStore = defineStore('board', () => {
  const chessEngine = new VueChessEngine();
  const pieces = new BasePiecesStore<VNode>(chessEngine);
  chessEngine.setPiecesStore(pieces);
  const pieceToMove = ref(0);
  pieces.setupPiecesByJSON(standart);

  pieces.calcPath();

  const board = new VueBoard(pieces);
  const { cells } = board;

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
    const piece = pieces.getPieceById(pieceId);
    if (piece) {
      board.showPath(piece?.getAvailableCells(), true);
    }
  };

  const dragEnd = () => {
    const piece = pieces.getPieceById(pieceToMove.value);
    if (piece) {
      board.showPath(piece?.getAvailableCells(), false);
    }
    pieceToMove.value = 0;
  };

  return { board: cells, move, dragStart, dragEnd, pieceToMove };
});
