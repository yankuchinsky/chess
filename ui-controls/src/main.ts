import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue'
import Dev from '@/pages/Dev.vue';
import Game from '@/pages/Game.vue';

const routes: any = [
  { path: '/dev', component: Dev },
  { path: '/game', component: Game },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.mount('#app');
