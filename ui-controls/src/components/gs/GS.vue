<script lang="ts" setup>
import { ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';

const game = useGameStore();
const user = useUserStore();

const createGame = async () => {
  const userData = await user.createUser();
  const gameData = await game.createGame(userData.id.toString());
  console.log('gameData', gameData);
};
</script>
<template>
  <div>
    <button @click="createGame">Create game</button>
  </div>
</template>
