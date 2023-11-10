<script lang="ts" setup>
import { ref } from 'vue';
import { useBoardStore } from '@/stores/board';
import type { VuePiece } from '@/types';

const boardStore = useBoardStore();

const props = defineProps<{ data: VuePiece }>();
const piece = ref(null);

const dragStart = () => {
  if (props.data?.getId()) {
    boardStore.dragStart(props.data.getId());
  }
};

const dragEnd = () => {
  if (props.data) {
    boardStore.move(boardStore.pieceToMove, props.data.getCurrentPosition());
    boardStore.dragEnd();
  }
};

const dragOver = (e: Event) => {
  e.preventDefault();
};
</script>

<template>
  <div class="piece" ref="piece" @mousedown="dragStart" draggable="true">
    <img class="piece-icon" :src="`src/assets/${data.getType()}.png`" :piece-id="data.getId()" />
  </div>
</template>

<style scoped>
.piece {
  background-color: transparent;
  cursor: pointer;
}

.piece:active {
  background-color: transparent;
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
