<script>
    import { goto } from '$app/navigation';
    import { dataLength } from 'ethers';
    import { createEventDispatcher } from 'svelte';

    export let data;

    const dispatch = createEventDispatcher();
    let address = '';

    /**
     * @param {{ preventDefault: () => void; }} event
     */
    function handleSubmit(event) {
        event.preventDefault();

        // check if deployed on gnosis? 

        // setSafeAddress(address);
        // safeSrv.addThisSignerToSafe(address)
        address = '';
        goto('/account'); 
    }
</script>

<style>

    article {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        margin: 3rem 0;

        form {
            display: flex;
            width: 100%;
            flex-direction: column;
            justify-content: space-around;
            align-items: center; 
            min-height: 240px;
        }
    }
</style>

<article>

    <form on:submit={handleSubmit}>
        <label for="address">Swap Safe:</label>
        <p>You can enter the address of an existing safe. The safe must be deployed on the gnosis chain.</p>
        <input 
            type="text" 
            id="address" 
            bind:value={address} 
            placeholder="Safe address" 
            required 
        />
        <button type="submit">save</button>
    </form>

</article>


