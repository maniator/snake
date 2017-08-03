import {Board} from "./board.js";

const board = new Board();

board.newGame();
board.gameOver({ noMessage: true });