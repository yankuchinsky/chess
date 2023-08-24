<script setup lang="ts">
import Board from '@/components/chess/Board.vue';
import GS from '@/components/gs/GS.vue';
</script>

<template>
  <Board />
  <div class="modal">
    <GS />
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: space-between;
}
.controls {
  border: 1px solid #000;
}

.modal {
  position: absolute;
  right: 100px;
  top: 20px;
}
</style>
