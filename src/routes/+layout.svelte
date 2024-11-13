<script>

	import Entry from '$lib/components/Entry.svelte';
    import Nav from '$lib/components/Nav.svelte';
    import Signer from '$lib/components/Signer.svelte';
    import { setContext } from 'svelte';
	export let data;

</script>

<style global lang="scss">
	@use '../global' as *;

	aside {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 1000;
	}
 </style>

<svelte:head>
    <link rel="stylesheet" type="text/css" href="https://cloud.typography.com/7060374/6692032/css/fonts.css" />
</svelte:head>



<main>
	<h1>Playground</h1>
	
	<Entry {data} />

	<section class="container">
		<slot />
	</section>
</main>

<aside>
	<Signer />	
	<Nav />
</aside>


