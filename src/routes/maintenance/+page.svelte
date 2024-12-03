
<script lang="ts">

    import { signer_key  } from '$lib/key.store';
    import { safe_addresses } from '$lib/safe.store';

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

    const handleImport = () => {
        
    }

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

    <button class="button" on:click={ () => handleSave()}>save your key on device</button>

    <button class="button" on:click={ () => handleImport()}>import key from file</button>

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

        button {
            margin: 1.5rem 0;
        }
    }

</style>