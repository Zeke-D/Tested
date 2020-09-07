<script>
	import TestedMap from "./components/TestedMap.svelte";
	import Login from './components/forms/Login.svelte';
	//<TestedMap/>
</script>

<main>
	<Login/>
</main>
<style>
	main {
		text-align: center;
		padding: 0;
		max-width: 240px;
		margin: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>