<script>
	import {count} from './components/stor';
	import AddPr from './components/addPr.svelte';
	let a = 10;
	let b = {
		t: 1,
		s: 3,
	};

	console.log(b);
</script>

<div>
	<form action="">
		Store:{$count}
		<input
			type="button"
			value="+"
			on:click={() => count.update((item) => (item += 1))}
		/>
	</form>
	<AddPr my_text="qwe" />
</div>

<style>
	:global(body) {
		background: #153;
	}
</style>
