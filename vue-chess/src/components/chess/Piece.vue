<script lang="ts" setup>
import { ref } from 'vue';
import { useBoardStore } from '@/stores/board';

const boardStore = useBoardStore();

const props = defineProps({ data: Object });
const piece = ref(null);

const dragStart = (e) => {
  e.preventDefault();
  console.log('event', e);
  console.log('piece', piece.value)
  piece.value.setAttribute('style', `transform: translateX(${e.clientX}px);`)
  if (props.data?.id) {
    boardStore.dragStart(props.data.id);
  }
};

const dragEnd = () => {
  boardStore.move(boardStore.pieceToMove, props.data.currentPosition);
  boardStore.dragEnd();
};

const dragOver = (e: Event) => {
  e.preventDefault();
};
</script>

<template>
  <!-- <div class="piece" ref="piece" draggable="true" @dragstart="dragStart" @drop="dragEnd" @dragover="dragOver">
    <img class="piece-icon" :src="`src/assets/${data.type}.png`" :piece-id="data.id" />
  </div> -->
  <div class="piece" ref="piece" @mousedown="dragStart">
    <img class="piece-icon" :src="`src/assets/${data.type}.png`" :piece-id="data.id" />
  </div>
</template>

<style scoped>
.piece {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  cursor: pointer;
}

.piece:active {
  cursor: pointer;
  opacity: 1;
}

.piece-icon {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  pointer-events: none;
}
</style>
