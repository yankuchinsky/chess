<script lang="ts" setup>
import { ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';

const game = useGameStore();
const user = useUserStore();

const gameId = ref('');
const gameToJoinId = ref('');
const pendingGame = ref(false);

const createGame = async () => {
  const userData = await user.createUser();
  const gameData = await game.createGame(userData.id.toString());
  gameId.value = gameData.id; 
};

const joinGame = async () => {
  const userData = await user.createUser();
  const gameData = await game.joinGame(gameToJoinId.value.toString(), userData.id.toString())
}
</script>
<template>
  <div>
    <h2>Create new game</h2>
    <button @click="createGame">Create</button>
    <div v-if="gameId">
      {{ gameId }}
    </div>
  </div>
  <div v-if="!pendingGame">
    <h2>Join the game</h2>
    <input v-model="gameToJoinId"/>
    <button @click="joinGame">Join</button>
  </div>
</template>
