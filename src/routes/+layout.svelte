<script lang="ts">
    import { goto } from '$app/navigation';


	import Entry from '$lib/components/Entry.svelte';
    import Nav from '$lib/components/Nav.svelte';
    import Signer from '$lib/components/Signer.svelte';
    import Ticker from '$lib/components/Ticker.svelte';
    import {friend_address } from '$lib/contacts.store.js';
    import { hasAvatar } from '$lib/safe.store.js';
	export let data;

	const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

	const handleInviteRequested = async (event: any) => {
 
		if (!$hasAvatar) {
			friend_address.set(event.detail);
        	goto('/avatar')
		} else {
			// reciprocate 
		}
		
	}

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

	<Ticker on:friend_address_event={handleInviteRequested} />

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




