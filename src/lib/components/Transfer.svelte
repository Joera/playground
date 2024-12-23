<script lang="ts">
    import { hubv2_abi } from "$lib/circles_hub_v2";
    import { HUBV2ADDRESS } from "$lib/constants";
    import { addressToUint256, fixSafeAddress } from "$lib/factory/eth.factory";
    import { findSrvByChain, safe_store } from "$lib/store/safe.store";
    import { avatar_state, transfer_state } from "$lib/store/state.store";
    import { ethers } from "ethers";
    import SpinnerWaveHuge from "./SpinnerWaveHuge.svelte";

    export let toAddress;

    const handleSubmit = async (event: any) => {

        const srv = await findSrvByChain("gnosis");

        if (srv) {

            transfer_state.set("spinner");

            const r = await srv.genericTx(HUBV2ADDRESS,hubv2_abi,"safeTransferFrom", [
                fixSafeAddress(srv.safe_address),
                fixSafeAddress(toAddress), 
                addressToUint256(srv.safe_address),
                ethers.parseUnits(event.target.amount.value, "ether"), 
                "0x"
                ], 
                false
            );
            console.log(r);
            transfer_state.set("");
            avatar_state.set("activities");
        }
       
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

        {#if $transfer_state == "spinner"}
            <SpinnerWaveHuge></SpinnerWaveHuge>
        {:else}
            <button class="pill" type="submit">Transfer</button>
        {/if}

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