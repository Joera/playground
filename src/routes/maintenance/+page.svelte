
<script lang="ts">

    import { signer_key  } from '$lib/key.store';
    import { safe_addresses } from '$lib/safe.store';
    import { onMount } from 'svelte';

    console.log($signer_key);

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
        a.download = 'plg_backup.json';
        a.click();
        URL.revokeObjectURL(url);
        
    }

    // const handleImport = () => {

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

    <!-- <div>
        <label>private key</label>
        <div>{$signer_key}</div>
    </div>

    <div>
        <label>safes</label>
    {#each $safe_addresses as safe}
        <div>{safe}</div>
    {/each} -->

    <label>Store your key on device</label>
    <button class="button" on:click={ () => handleSave()}>save</button>

    <label>Import key from file</label>
    <input class="button" id="file_import" type="file" accept=".json">

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