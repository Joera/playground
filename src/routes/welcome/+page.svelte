<script>
    import { goto } from "$app/navigation";
    import { initPK } from "$lib/key.store";
    import { addSafe } from "$lib/safe.store";

    // Function to handle button clicks
    const default_setup = async () => {
        await initPK();
        await addSafe(0);
        goto('/avatar');
    };

    const advanced_setup = () => {
        console.log("Button 2 clicked");
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

    h2 {
        margin-bottom: 3rem;
    }
</style>

<h2>Welcome!</h2>

<div>
    <label>Click the button to create a private key, deploy a safe on the Gnosis chain and register a circles avatar with the safe address.</label>
 <button class="button" on:click={default_setup}>Do it!</button>
 <!-- <label>advanced: (requires configuring)</label>
 <button class="button" on:click={advanced_setup}>Existing Safe & Circles avatar</button> -->
</div>

