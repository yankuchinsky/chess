<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBoardStore } from '@/stores/board';
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore();
const { pieceToMove, moves } = storeToRefs(boardStore);
const isCalculationDisabled = boardStore.chessEngine.getCalculationDisabledStatus();


const toggleCalculation = (e) => {
  boardStore.chessEngine.toggleCalculation(e.target.checked);
}

watch(moves, () => {console.log('changed')}, {deep: true})

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
    <div>Moves 
      <ul>
        <li v-for="move in moves">
          piece {{ move.piece }} prev {{ move.prevPosition }} new {{ move.newPosition }}
        </li>
      </ul>
    </div>
    <div>
      {{ pieceToMove }}
    </div>
  </div>
</template>
