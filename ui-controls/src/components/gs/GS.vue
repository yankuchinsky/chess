<script lang="ts" setup>
import { ref } from 'vue';
import { useGameStore } from '@/stores/game';

const game = useGameStore();

const createGame = async () => {
  const gameData = await game.createGame();
};
</script>
<template>
  <div>
    <button @click="createGame">Create game</button>
  </div>
</template>
