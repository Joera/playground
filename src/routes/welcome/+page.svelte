<script lang="ts">
    import { goto } from "$app/navigation";
    import { initPK, signer_key } from "$lib/store/key.store";
    import { addSafe, safe_addresses } from "$lib/store/safe.store";
    import { onMount } from "svelte";

    import { welcome_state } from "$lib/store/state.store";
    import { initApp } from "$lib/factory/app.factory";
    import SpinnerWave from "$lib/components/SpinnerWave.svelte";

    // Function to handle button clicks
    const default_setup = async () => {
        await initPK();
        await addSafe("gnosis");
        await addSafe("base");
        goto('/avatar');
    };

    onMount(async () => {

        const input = document.getElementById('file_import') as HTMLInputElement;
            input.addEventListener('change', async (event) => {
                
                const file = (event.target as HTMLInputElement).files?.[0];
                console.log(file);
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = async (event) => {
                    console.log(event)
                    const data = event.target?.result;
                    const object = JSON.parse(data as string);
                    console.log(object);
                    signer_key?.set(object.signer_key);
                    console.log(1)
                    safe_addresses?.set(object.safe_addresses);
                    console.log(2)
                    welcome_state.set('spinner');
                    await initApp();
                    welcome_state.set('')
                    goto('/avatar');

                };
                reader.readAsText(file);
                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                };
                
        });
    });
    
</script>

<style global lang="scss">
    article {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        min-height: 240px;
        max-width: calc(100% - 4rem);

        label {
            text-align: center;
            line-height: 1.55;
            margin: 0 .75rem .75rem;
        }
    }

    h2 {
        margin-bottom: 3rem;
    }

    .centered {
        margin-top: 3rem;
    }

    input#file_import {
        max-width: 230px;
    }
</style>

<h2>Welcome!</h2>

<article>

    {#if $welcome_state == "spinner"}

        <SpinnerWave></SpinnerWave>

    {:else}

        <label>Click the button to create a private key, deploy a safe on the Gnosis chain and register a circles avatar with the safe address.</label>
        <button class="button" on:click={default_setup}>Do it!</button>
        <!-- <label>advanced: (requires configuring)</label>
        <button class="button" on:click={advanced_setup}>Existing Safe & Circles avatar</button> -->
        <div class="centered">
            <label>.. or restore from backup</label>
            <input class="button" id="file_import" type="file" accept=".json,.txt">
        </div>
    {/if}
</article>

