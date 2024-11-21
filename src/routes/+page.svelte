<script lang="ts">
    import SafeOverview from '$lib/components/SafeOverview.svelte';
    import { safe_store, addSafe } from '$lib/safe.store';

    $: safeEntries = Object.entries($safe_store);

    const handleAddSafe = async () => {
        addSafe();
    }

</script>

<style>
    #safes {
        display: flex;
        flex-direction: row;
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

    button {
        border: none;
        font-size: 6rem;
        font-weight: 400;
    }


</style>


    <section id="safes">

        {#if $safe_store && Object.keys($safe_store).length > 0}
            {#each safeEntries as [safe_address, safeSrv]}        
                <SafeOverview {safe_address} {safeSrv} />
            {/each}
        {/if}
        <article class="safe_container">
            <button on:click={handleAddSafe}>+</button>
        </article>
    </section>
  

