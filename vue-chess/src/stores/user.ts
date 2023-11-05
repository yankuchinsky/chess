import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const createUser = async () => {
    const response = await fetch('http://localhost:3000/user');
    const user = await response.json();

    return user;
  };

  return { createUser };
});
