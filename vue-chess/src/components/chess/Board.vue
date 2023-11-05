<script lang="ts" setup>
import { useBoardStore } from '@/stores/board';
import Cell from './Cell.vue';
import Piece from './Piece.vue';
// import Socket from '@/helpers/Socket';

const boardStore = useBoardStore();

const cells = boardStore.board;

const mouseOver = () => {
  if (boardStore.pieceToMove) {
    console.log('move')
  }
}

const dragEnd = () => {
  console.log('end')
  boardStore.dragEnd();
}

// Socket.on('move', (data) => {
//   //
// });
</script>

<template>
  <div class="board" @mouseover="mouseOver" @mouseup="dragEnd">
    <div v-for="row in cells" class="row">
      <div v-for="cell in row" class="cell-wrapper">
        <Cell :color="cell.color" :id="cell.id" :isPath="cell.path" />
        <Piece v-if="cell.piece" :data="cell.piece" />
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
  width: 65px;
  height: 65px;
}
</style>
