import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  const createGame = async () => {
    const response = await fetch('http://localhost:3000/game');
    const game = await response.json();

    console.log('game', game);

    return game;
  };

  return { createGame };
});
