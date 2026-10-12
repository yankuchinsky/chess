import jsonSetup from './templates/standart.json';
import test from './templates/test.json';
import htmlChess from './html-chess';

const body = document.querySelector("body");

const field = htmlChess.bootstrap(jsonSetup);

body?.appendChild(field);
