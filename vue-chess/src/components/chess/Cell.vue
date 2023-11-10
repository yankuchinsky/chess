<script lang="ts" setup>
  import { useBoardStore } from '@/stores/board';

  const boardStore = useBoardStore();

  const props = defineProps({ color: String, id: Number, isPath: Boolean });

  const dragEnd = () => {
    if (props.id) {
      boardStore.move(boardStore.pieceToMove, props.id);
    }
    boardStore.dragEnd();
  }

  const dragOver = (e: Event) => {
    e.preventDefault();
  }
</script>
<template>
  <div
    class="cell"
    :class="`cell-${color} ${props.isPath ? 'path' : ''}`"
    :cell-id="id"
    @drop="dragEnd"
    @dragover="dragOver"
  >
    <div class="cell-number">
      {{ id }}
    </div>
    <slot></slot>
  </div>
</template>
<style scoped>
.cell {
  width: 65px;
  height: 65px;
}

.path {
  background-color: rgb(255, 106, 0) !important;
}

.cell-black {
  background-color: rgb(0, 165, 255);
}

.cell-white {
  background-color: rgb(255, 255, 255);
}

.cell-number {
  position: absolute;
  font-size: 10px;
}
</style>
