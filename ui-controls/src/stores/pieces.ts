import { ref, computed, VNode, Ref, reactive } from 'vue';
import { defineStore } from 'pinia';
import standart from '../templates/standart.json';
import { BasePiecesStore } from 'chess-engine';

export const usePiecesStore = defineStore('pieces', () => {
  const pieces = new BasePiecesStore<VNode>();
  const piece = ref(0);
  pieces.setupPiecesByJSON(standart);
  const piecesController = reactive(pieces)
  const allPieces = reactive(pieces.getAllPieces());

  const move = (currCell: number, cellToMoveId: number) => {
    pieces.move(currCell, cellToMoveId);
  }

  const dragStart = (pieceId: number) => {
    piece.value = pieceId;
  }

  const dragEnd = () => {
    piece.value = 0;
  }

  return { piecesController, allPieces, move, dragStart, dragEnd, piece };
});
