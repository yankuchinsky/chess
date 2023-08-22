<script setup lang="ts">
  import Board from '@/components/chess/Board.vue';
  import Controls from '@/components/controls/Controls.vue';
  import GS from '@/components/gs/GS.vue';
</script>

<template>
  <Board />
  <Controls />
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
</style>
<style>
html, body {
  font-family: Arial, Helvetica, sans-serif;
}

.modal {
  position: absolute;
  right: 100px;
  top: 20px;
}
</style>