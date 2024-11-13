<script>
    import { initPK } from "$lib/key.store";

    // Function to handle button clicks
    const newKey = async () => {
        await initPK();
    };

    const enterKey = () => {
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

<h1>Welcome</h1>

<div>
 <button on:click={newKey}>Generate new key</button>
    <button on:click={enterKey}>Use existing account</button>
</div>

