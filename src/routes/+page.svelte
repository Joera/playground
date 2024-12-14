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

        console.log("---------------")

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

    <section class="scrolltainer">

        <h2>{$chain}</h2>
        {#if $safeSrv}
            <SafeOverview {safeSrv} />
        {:else}
            <SpinnerWave></SpinnerWave>
        {/if}

    </section>

    <nav>
        {#each $chains as chain}
        <button class="button" on:click="{() => handleChain(chain)}">{chain}</button>
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

        nav {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;

            > button {
                margin: 0 .5rem;
            }
        }
    
        /* button {
            border: none;
            font-size: 6rem;
            font-weight: 400;
        } */
    
    
    </style>