<script lang="ts">
    import { roundBalance } from "$lib/factory/eth.factory";
    import { oftBridgeTx } from "$lib/factory/oft.factory";
    import { tokenList, type IToken } from "$lib/factory/token.factory";
    import { oft_abi } from "$lib/oft_abi";
    import type { SafeService } from "$lib/safe.service";
    import { ethers } from "ethers";
    import { writable, type Writable } from "svelte/store";
    import IconTransfer from "./IconTransfer.svelte";
    import IconBridge from "./IconBridge.svelte";
    import SpinnerWave from "./SpinnerWave.svelte";

    export let safeSrv: Writable<SafeService>;
    export let token: IToken;

    // token Class ? 

    const token_state = writable("");

    const transfer = async (event: any) => {

        token_state.set("spinner");
        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());
        console.log(formData);

        const abi = [
            {
                constant: false,
                inputs: [
                    { name: "_to", type: "address" },
                    { name: "_value", type: "uint256" }
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                type: "function",
                stateMutability: "nonpayable"
            }
        ];

        const amountInWei = ethers.parseUnits(formData.amount, token.decimals);

        if (token.name == "LLL" && $safeSrv.chain != formData.chain) {

            const { sendParam, fee } = await oftBridgeTx($safeSrv, token.address, formData);
            if (sendParam) {
                await $safeSrv.genericTx(token.address || "", oft_abi, "send", [sendParam, fee, $safeSrv.safe_address], false);
            }

        } else if (token.native) {
            await $safeSrv.nativeTx(formData.to, amountInWei.toString());
        } else {
            await $safeSrv.genericTx(token.address, abi, "transfer", [formData.to, amountInWei], false);
        }


        await $safeSrv.getBalances();
        token_state.set("");
    }

    const handleTansfer = async () => {

            token_state.set("transfer");
    }
  


</script>


<article>

    {#if $token_state == "spinner"}

        <SpinnerWave></SpinnerWave>

    {:else}

        <div class="token">

            <span class="token_name">{token.symbol}</span>
            <span class="token_balance">{parseFloat(token.balance).toFixed(2)}</span>
            <div class="token_actions">
                <button class="icon" on:click={handleTansfer}><IconTransfer></IconTransfer></button>
                <!-- {#if token.name == "LLL"}
                    <button class="icon" on:click={handleOFTBridge}><IconBridge></IconBridge></button>
                {/if} -->
            </div>

        </div>

        {#if $token_state == "transfer"}

        <form class="token_form" on:submit={transfer}>
         
            {#if token.name == "LLL"}
                <select id="chain" name="chain">
                    <option value="base">base</option>
                    <option value="gnosis">gnosis</option>
                    <option value="linea">linea</option>
                </select>
            {/if}
    
            <input id="to" name="to" type="text" placeholder="recipient address" />
            <input id="amount" name="amount" type="number" step="0.00001" min="0" placeholder="amount"/>
            <button class="button" type="submit">Transfer</button>
        </form>

        {/if}

    {/if}
    
</article>


<style>


</style>