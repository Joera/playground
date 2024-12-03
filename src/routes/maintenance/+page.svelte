
<script lang="ts">
    import SignerForm from '$lib/components/SignerForm.svelte';
    import SpinnerWave from '$lib/components/SpinnerWave.svelte';
    import { signer_key  } from '$lib/key.store';
    import { circles_addresses, safe_addresses, safe_store } from '$lib/safe.store';
    import { maintenance_state } from '$lib/state.store';
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

        console.log(1)
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
        });
        // input.click();
    })

</script>


<article>

    {#if $maintenance_state == "spinner"}

        <SpinnerWave></SpinnerWave>

    {:else if $maintenance_state == "remotesigner"}

        <SignerForm on:signer_address_event={(event) => handleAddSigner(event.detail)}></SignerForm>

    {:else}

        <div>
            <label>eoa</label>
            <!-- <div>{owner_address}</div> -->
        </div>

        <label>Remote signer</label>
        <button class="button"on:click={handleRemoteSigner}>add</button>


        <label>Store your key on device</label>
        <button class="button" on:click={ () => handleSave()}>save</button>

        <label>Import key from file</label>
        <input class="button" id="file_import" type="file" accept=".json">

    {/if}

</article>


<style>

    article {

        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        button, input {
            margin: .75rem 0 3rem 0;
        }

        input {

        }
    }

</style>