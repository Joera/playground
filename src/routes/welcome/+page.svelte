<script>
    import { goto } from "$app/navigation";
    import { initPK } from "$lib/key.store";
    import { addSafe } from "$lib/safe.store";

    // Function to handle button clicks
    const default_setup = async () => {
        await initPK();
        await addSafe();
        goto('/avatar');
    };

    const advanced_setup = () => {
        console.log("Button 2 clicked");
        // Add your action for Button 2 here
    };
</script>

<style global lang="scss">
    div {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        min-height: 240px
    }
</style>

<h2>Welcome!</h2>

<div>
    <label>default:</label>
 <button on:click={default_setup}>New Safe & Circles avatar</button>
 <label>advanced: (requires configuring)</label>
 <button on:click={advanced_setup}>Existing Safe & Circles avatar</button>
</div>

