<script>
	import TestedMap from "./components/TestedMap.svelte";
</script>

<main>
	<TestedMap/>
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