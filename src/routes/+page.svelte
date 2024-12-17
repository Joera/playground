<script lang="ts">
    import SafeOverview from '$lib/components/SafeOverview.svelte';
    import SpinnerWave from '$lib/components/SpinnerWave.svelte';
    import type { SafeService } from '$lib/safe.service';
    import { safe_store, safe_addresses, waitForSafeStoreToBePopulated, chain_array, findAddressByChain, findSrvByChain} from '$lib/store/safe.store';
    import { onMount } from 'svelte';
    import { writable, type Writable } from 'svelte/store';

    let chains: Writable<string[]> = writable(chain_array);   
    let safeSrv: Writable<SafeService> = writable();
    let chain: Writable<string> = writable("");

    const handleChain = async (c: string) => {

        const srv = await findSrvByChain(c);

        if(srv) {   
            safeSrv.set(srv);
            chain.set(c);
        }
    }

    onMount(async () => {
        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses);
        handleChain('gnosis');
    })

</script>

    <h2>{$chain} wallet</h2>

    <section class="scrolltainer">

        
        {#if $safeSrv}
            <SafeOverview {safeSrv} />
        {:else}
            <SpinnerWave></SpinnerWave>
        {/if}

    </section>

    <nav class="sub">
        {#each $chains as chain}
        <button class="pill" on:click="{() => handleChain(chain)}">{chain}</button>
        {/each}        
    </nav>
  

    <style>
        #safes {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: calc(100vw - 1rem);
            /* min-height: calc(100vh - 16rem); */
            overflow: auto;
            margin: 0 .5rem;
            height: 100%;
    
            @media screen  and (min-width: 860px) {
                justify-content: center;
            }
        }

    </style>