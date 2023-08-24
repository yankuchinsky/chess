import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  const createGame = async (userId: any) => {
    console.log('user id', userId);
    const response = await fetch('http://localhost:3000/game/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const game = await response.json();

    return game;
  };

  return { createGame };
});
