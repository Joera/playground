<script lang="ts">
    import { roundBalance } from "$lib/factory/eth.factory";
    import { tokenList, type IToken } from "$lib/factory/token.factory";
    import type { SafeService } from "$lib/safe.service";
    import { writable, type Writable } from "svelte/store";
    import IconTransfer from "./IconTransfer.svelte";

    export let safeSrv: Writable<SafeService>;
    // export let token: IToken;
    export let contact: any;

    const mintable = writable(0);
    const token_state = writable("");


    // this should be bound upwards
    // if (token.mintable != undefined && parseFloat(token.mintable) > 0) {
    //     mintable.set(parseFloat(token.mintable));
    // }

    const handleMint = async () => {
        
        token_state.set("spinner");
        await $safeSrv.mintCircles();
        // display link to tx on scan? (txs page?? )
        //   await srv.getCircles();
        token_state.set("");
    }

    const handleTansfer = async () => {
       
        const to = "0x0000000000000000000000000000000000000000";
        const id = "0x0000000000000000000000000000000000000000";
        const value = 1;
        $safeSrv.transferCircles(to,id,value);
    }


</script>


<article class="token crc">

    <div class="token_top">

        <span class="token_name crc">{contact.objectName}</span>
        <span class="token_balance">{#if isNaN(contact.balance)} 0 {:else} {parseFloat(contact.balance).toFixed(0)}{/if}</span>

        <div class="token_actions">
        {#if $mintable > 0}
            <button class="link" on:click={handleMint}>+{$mintable.toFixed(0)}</button>
        {/if}
        <button class="icon"><IconTransfer></IconTransfer></button>
    
    </div>

</article>