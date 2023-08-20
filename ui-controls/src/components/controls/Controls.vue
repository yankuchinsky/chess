<script setup lang="ts">
import { ref } from 'vue';
import { useBoardStore } from '@/stores/board';

const { chessEngine } = useBoardStore();
const isCalculationDisabled = chessEngine.getCalculationDisabledStatus();

const toggleCalculation = (e) => {
  chessEngine.toggleCalculation(e.target.checked);
}

const isWhiteMove = ref(true);
</script>
<template>
  <div>
    <h3>Controls</h3>
    <div>
      <label>
        Disable move calculation
        <input type="checkbox" @change="toggleCalculation" :checked="isCalculationDisabled"/>
      </label>
    </div>
    <h4>Dev data</h4>
    <div>Current move {{ isWhiteMove ? 'white' : 'black' }}</div>
  </div>
</template>
