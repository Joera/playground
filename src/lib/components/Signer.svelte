
<script lang="ts">
    import { goto } from '$app/navigation';
    import { displayAddress, displayShortAddress } from '$lib/eth.factory';
    import { signer_key } from '$lib/key.store';
    import { safe_addresses } from '$lib/safe.store';
    import { Wallet } from 'ethers';

    function addressFromKey(privateKey: string) {
        if (privateKey == "") return "";
        const wallet = new Wallet(privateKey);
        return wallet.address;
    }

    function handleMaintenance() {
        goto("/maintenance");
    }

</script>


{#if $signer_key != ""}

    <button id="signer" on:click={handleMaintenance}>

        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 512 640" width="51" height="41"  xml:space="preserve"><path d="M484.6,230.6h-283c-11.4-43.7-50.8-76.2-98-76.2C47.6,154.4,2,200,2,256c0,56,45.6,101.6,101.6,101.6  c47.2,0,86.6-32.5,98-76.2h130.6v25.4c0,14,11.4,25.4,25.4,25.4c14,0,25.4-11.4,25.4-25.4v-25.4h50.8v25.4c0,14,11.4,25.4,25.4,25.4  c14,0,25.4-11.4,25.4-25.4v-25.4c14,0,25.4-11.4,25.4-25.4C510,242,498.6,230.6,484.6,230.6z M103.6,306.8  c-28,0-50.8-22.8-50.8-50.8c0-28,22.8-50.8,50.8-50.8c28,0,50.8,22.8,50.8,50.8C154.4,284,131.6,306.8,103.6,306.8z"/>
        </svg>
        <!-- <span>{displayAddress("gno", addressFromKey($signer_key))}</span> -->
         <span>{displayShortAddress($safe_addresses[0])}</span>

    </button>

{/if}


<style>

#signer {
    background: black;
    height: 2.8rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    svg {
       
        margin-top: 9px;
        fill: white;
        margin-right: .75rem;

    }

    span {
        color: white
    }
}

</style>
