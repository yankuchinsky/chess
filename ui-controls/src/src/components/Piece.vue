<script lang="ts" setup>
import { ref } from 'vue';
import { useBoardStore } from '@/stores/board';

const boardStore = useBoardStore();

const props = defineProps({ data: Object });
const piece = ref(null);

const dragStart = () => {
  boardStore.dragStart(props.data.id);
};

const dragEnd = () => {
  boardStore.move(boardStore.pieceToMove, props.data.id);
};

const dragOver = (e: Event) => {
  e.preventDefault();
};
</script>

<template>
  <div class="piece" ref="piece" draggable="true" @dragstart="dragStart" @drop="dragEnd">
    <div class="icon-wrapper" @dragover="dragOver">
      <img
        class="piece-icon"
        :src="`src/assets/${data.type}.png`"
        :piece-id="data.id"
      />
    </div>
  </div>
</template>

<style scoped>
.piece {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.icon-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.piece-icon {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  pointer-events: none;
}
</style>
