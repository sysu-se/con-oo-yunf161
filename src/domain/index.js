import { Sudoku } from '../node_modules/@sudoku/sudoku_pack.js';
import { Game } from '../node_modules/@sudoku/Game_pack.js';

export function createSudoku(grid) {
	return new Sudoku(grid);
}

export function createSudokuFromJSON(json) {
	const sudoku = new Sudoku();
	sudoku.fromJSON(json);
	return sudoku;
}

export function createGame({ sudoku } = {}) {
	const grid = sudoku instanceof Sudoku ? sudoku.getGrid() : sudoku;
	return new Game(grid);
}

export function createGameFromJSON(json) {
	const game = new Game();
	game.fromJSON(json);
	return game;
}

export { Sudoku, Game };