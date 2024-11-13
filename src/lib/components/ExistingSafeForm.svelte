<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let address = '';

    /**
     * @param {{ preventDefault: () => void; }} event
     */
    function handleSubmit(event) {
        event.preventDefault();
        // Dispatch the address to the parent component
        dispatch('add', { address });
        // Reset the input
        address = '';
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
        <label for="address">Safe Address:</label>
        <input 
            type="text" 
            id="address" 
            bind:value={address} 
            placeholder="Safe address" 
            required 
        />
        <button type="submit">Use this safe</button>
    </form>

</article>


