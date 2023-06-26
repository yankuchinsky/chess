<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { useBoardStore } from '@/stores/board';
import { usePiecesStore } from '@/stores/pieces';

import Cell from './Cell.vue';
import Piece from './Piece.vue';

const boardStore = useBoardStore();
const piecesStore = usePiecesStore();

const cells = boardStore.board;
const pieces = piecesStore.piecesController;
const allPieces = piecesStore.allPieces;
// const setRefToCell = piecesStore.setRefToCell;
let isStarted = false;

const boardElement = ref(null);

onMounted(() => {
  console.log('____', boardElement);
  // boardStore.setRefToCell();
});
let piece1; 
const mouseDown = e => {
  console.log('board', e.target.tagName);

  if (e.target.tagName.toLowerCase() === 'img') {
    const pieceId = +e.target.getAttribute('piece-id');
    const piece = pieces.getPieceById(pieceId);
    
    piece1 = piece;
  }
}

const mouseUp = e => {
  const target = e.originalTarget;
  
  if (target.tagName.toLowerCase() !== 'div') {
    const pieceId = +e.target.getAttribute('piece-id');
    const piece = pieces.getPieceById(pieceId);

    const position = piece.getCurrentPosition();

    piece1.setCurrentPosition(position);
  } else {
    const position = +target.getAttribute('cell-id');
    piece1.setCurrentPosition(position);
  }

}

const boardClick = (e) => {
  if (!isStarted) {
    mouseDown(e);
  } else {
    mouseUp(e);
  }


  isStarted = !isStarted;
}

</script>

<template>
  <div class="board" @ref="boardElement" @click="boardClick">
    <div v-for="row in cells" class="row">
      <div v-for="cell in row" class="cell-wrapper">
        <Cell :color="cell.color" :id="cell.id" />
        <Piece v-if="pieces.getPieceByPosition(cell.id)" :data="pieces.getPieceByPosition(cell.id)"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  border: 1px solid #000;
  width: 520px;
  height: 520px;
  display: flex;
  flex-direction: column-reverse;
}

.row {
  display: flex;
}

.cell-wrapper {
  position: relative;
}
</style>
