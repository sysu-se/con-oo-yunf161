<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import { modal } from '@sudoku/stores/modal';
	import { gameWon } from '@sudoku/gamestore';
	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';
	import { pauseGame, resumeGame } from '@sudoku/game';

	gameWon.subscribe(won => {
		if (won) {
			pauseGame();
			modal.show('gameover');
		}
	});

	onMount(() => {
		let hash = location.hash;

		if (hash.startsWith('#')) {
			hash = hash.slice(1);
		}

		let sencode;
		if (validateSencode(hash)) {
			sencode = hash;
		}
		
		modal.show('welcome', { onHide: resumeGame, sencode });
	});
</script>

<!-- Timer, Menu, etc. -->
<header>
	<Header />
</header>

<!-- Sudoku Field -->
<section>
	<Board />
</section>

<!-- Keyboard -->
<footer>
	<Controls />
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>