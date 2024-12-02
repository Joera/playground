<script lang="ts">
    import { hubv2_abi } from "$lib/circles_hub_v2";
    import { HUBV2ADDRESS } from "$lib/constants";
    import { fixSafeAddress } from "$lib/eth.factory";
    import { circles_addresses, safe_store } from "$lib/safe.store";

    export let toAddress;

    const handleSubmit = async (event: any) => {

        circles_addresses.subscribe((addresses) => {
            safe_store.subscribe((safes) => {
                const srv = safes[addresses[0]];
                srv.subscribe(async (srv) => {
                    const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "safeTransferFrom", [fixSafeAddress(srv.safe_address),fixSafeAddress(toAddress), event.target.amount.value, null], false);
                    console.log(r);
                });
            });
        });
    }
    
</script>

<article>

    <form on:submit={handleSubmit}>
        <span>Send circles to </span>
        <span>

             {#if toAddress.length > 20}
                {toAddress.slice(0,6)} ... {toAddress.slice(-8)}
            <!-- {:else}
                {contact.objectName} -->
            {/if}
        </span>
        <input 
            type="number" 
            id="amount" 
            placeholder="0" 
            required 
        />
        <button class="button"type="submit">Transfer</button>
    </form>

</article>

<style>

    article {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        width: 100%;
        max-width: calc(100% - 4rem);
    }

    form {

        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        width: 100%;
    }

    input, button {
        margin-top: 3rem;
    }

</style>