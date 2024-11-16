<script>

	import Entry from '$lib/components/Entry.svelte';
    import Nav from '$lib/components/Nav.svelte';
    import Signer from '$lib/components/Signer.svelte';
    import { setContext } from 'svelte';
	export let data;

	const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

</script>

<style global lang="scss">
	@use '../global' as *;

	aside {
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 1000;
	}

	section {
		position: relative;

		height: calc((var(--vh, 1vh) * 100) - 3rem - 2.6rem - 3rem - 3rem - 1rem);

		@media screen and (min-width: 860px) {
			height: calc(100vh - 3rem - 4.8rem - 3rem - 3rem - 1rem);
		}
		
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




