
<script lang="ts">
    import { goto } from '$app/navigation';
    import CopyAddress from '$lib/components/CopyAddress.svelte';
    import SignerForm from '$lib/components/SignerForm.svelte';
    import SpinnerWave from '$lib/components/SpinnerWave.svelte';
    import { addressFromKey } from '$lib/factory/eth.factory';
    import { signer_key  } from '$lib/store/key.store';
    import { circles_addresses, safe_addresses, safe_store } from '$lib/store/safe.store';
    import { maintenance_state } from '$lib/store/state.store';
    import { onMount } from 'svelte';

    const handleSave = () => {
        
        const object = {
            signer_key: $signer_key,
            safe_addresses: $safe_addresses
        };

        const data = JSON.stringify(object);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plg_${$safe_addresses[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const handleRemoteSigner = async () => {
        maintenance_state.set("remotesigner")
        // popup
    }

    const handleAddSigner = async (address: string) => {

        maintenance_state.set("spinner");

        circles_addresses.subscribe(async (addresses) => {
            safe_store.subscribe(async (store) => {
                const safeService = (await store)[addresses[0]];
                safeService.subscribe(async (srv) => {
                    console.log(2)
                    await srv.addSigner(address);
                    maintenance_state.set("")
                });
            });
        });
    };

    const handleClear = async () => {
        
        localStorage.clear();
        goto('/');
    }


    onMount(() => {
        
        const input = document.getElementById('file_import') as HTMLInputElement;
        input.addEventListener('change', (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result;
                const object = JSON.parse(data as string);
                signer_key?.set(object.signer_key);
                safe_addresses?.set(object.safe_addresses);
            };
            reader.readAsText(file);
            goto('/avatar');
        });
        // input.click();
    })

</script>

<h2>Accounts</h2>

<section class="scrolltainer">

    <article>

        {#if $maintenance_state == "spinner"}

            <SpinnerWave></SpinnerWave>

        {:else if $maintenance_state == "remotesigner"}

            <SignerForm on:signer_address_event={(event) => handleAddSigner(event.detail)}></SignerForm>

        {:else}

            <div>
                <h3>Signer</h3>
                {#if $signer_key}
                    <CopyAddress address={addressFromKey($signer_key)}></CopyAddress>
                {/if}
            </div>

            <div>
                <h3>Safes</h3>
                <CopyAddress address={$safe_addresses[0]}></CopyAddress>
            </div>

            <div>
                <h3>Backup to device</h3>
                <button class="button" on:click={ () => handleSave()}>save</button>
            </div>

            <div>
                <h3>Restore from backup</h3>
                <input class="button" id="file_import" type="file" accept=".json">
            </div>

            <div>
                <h3>Clear localstorage</h3>
                <button class="button" on:click={ () => handleClear()}>clear</button>
            </div>

            <div>
                <h3>Remote signer</h3>
                <button class="button"on:click={handleRemoteSigner}>add</button>
            </div>

        {/if}

    </article>

</section>


<style>

    article {

        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        button, input {
            margin: .5rem 0 0 0;
        }

        #file_import {
            width: 260px;
        }

        input {

        }
    }

</style>