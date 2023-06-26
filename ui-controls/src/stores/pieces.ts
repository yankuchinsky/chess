import { ref, computed, VNode, Ref, reactive } from 'vue';
import { defineStore } from 'pinia';
import standart from '../templates/standart.json';
import { BasePiecesStore } from 'chess-engine';

export const usePiecesStore = defineStore('pieces', () => {
  const pieces = new BasePiecesStore<VNode>();
  pieces.setupPiecesByJSON(standart);
  const piecesController = reactive(pieces)
  console.log('pieces', pieces.getAllPieces());
  const allPieces = pieces.getAllPieces();

  const setRefToCell = (id: number, ref: Ref) => {
    // const flatBoard = allPieces;
    // console.log(flatBoard.map(el => el.id));
    const found = allPieces.find(el => el.id === id);
    found.pieceRef = ref;
  }

  return { piecesController, allPieces, setRefToCell };
});
