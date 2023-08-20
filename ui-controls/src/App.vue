<script setup lang="ts">
  import Board from '@/components/chess/Board.vue';
  import Controls from '@/components/controls/Controls.vue'
</script>

<template>
  <Board />
  <Controls />
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
</style>
./src/components/Board.vue