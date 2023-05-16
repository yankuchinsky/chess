<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import Cell from './Cell.vue'

  const size = 8;
  const cells: any[][] = reactive(Array.from(new Array(size), () => []));

  let isBlack = false;
  let idx = size * size;
  let fileIdx = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      idx -= 1;

      const currentFileIdx = idx - size + j * 2 + 1;
      const currentFileBoardMapIdx = size - fileIdx - 1;

      const x = currentFileBoardMapIdx;
      const y = j;

      cells[x][y] = { cellRef: ref(null), id: currentFileIdx, color: isBlack ? 'black' : 'white'  };

      isBlack = !isBlack;
    }
    isBlack = !isBlack;
    fileIdx += 1;
  }

  console.log('cells', cells);

</script>

<template>
  <div class="board">
    <div v-for="row in cells" class="row">
      <Cell v-for="cell in row" :color="cell.color" :id="cell.id"/>
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
</style>