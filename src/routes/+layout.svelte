<script>

	import Entry from '$lib/components/Entry.svelte';
    import { setContext } from 'svelte';
	export let data;

</script>

<style global lang="scss">
	@use '../global' as *;
 </style>

<svelte:head>
    <link rel="stylesheet" type="text/css" href="https://cloud.typography.com/7060374/6692032/css/fonts.css" />
</svelte:head>

<aside>
	<nav class="container">
		<a href="/">Home</a>
		<a href="/signer">Signer</a>
		<a href="/avatar">Avatar</a>
		<a href="/commons">Commons</a>
		<a href="/governance">Governance</a>
	</nav>
</aside>

<main>
	
	<Entry {data} />

	<section class="container">
		<slot />
	</section>
</main>

