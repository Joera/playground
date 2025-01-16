<script lang="ts">

    import type { SafeService } from "$lib/safe.service";
    import { get, writable, type Writable } from "svelte/store";
    import IconTransfer from "./IconTransfer.svelte";
    import type { IToken } from "$lib/factory/token.factory";
    import { onMount } from "svelte";
    import { ethers } from "ethers";
    import SpinnerWaveHuge from "./SpinnerWaveHuge.svelte";
    import { addressToUint256 } from "$lib/factory/eth.factory";
    import { HUBV2ADDRESS } from "$lib/constants";
    import { findSrvByChain } from "$lib/store/safe.store";

    export let safeSrv: Writable<SafeService>;
    export let token: any;
    const avatarName = writable("");
    const token_state = writable("");
    const showCustomAddress = writable(false);

    $: circles = get($safeSrv.circles);
    $: contacts = get($safeSrv.circles).contacts;

    const handleTansfer = async () => {
        token_state.set("transfer");

        const srv = await findSrvByChain("gnosis");
        if (srv) {
            get(srv.circles).personalMint();
        }
    }

    const transfer = async (event: any) => { 

        token_state.set("spinner");
        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());
        // console.log(formData);

        const abi = [
            {
                "inputs": [
                    {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                    },
                    {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                    },
                    {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                    },
                    {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                    },
                    {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                    }
                ],
                "name": "safeTransferFrom",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }

        ];

        const amountInWei = ethers.parseUnits(formData.amount, token.decimals);

        await $safeSrv.genericTx(
            HUBV2ADDRESS, 
            abi, 
            "safeTransferFrom", 
            [
                $safeSrv.safe_address,
                formData.to, 
                addressToUint256(token.issuerAddress), // token.tokenId
                amountInWei,
                "0x"
            ]
            , false);

        circles.updateBalances();
        token_state.set("");

    }

    onMount( async () => {

        const avatar = await circles.getAvatarName(ethers.getAddress(token.issuerAddress));
       
        avatarName.set(avatar);

    });


</script>


<article class="token crc">

    <div class="token_top">

        <span class="token_name crc">{$avatarName}</span>
        <span class="token_balance">{#if isNaN(token.totalBalance)} 0 {:else} {parseFloat(token.totalBalance).toFixed(0)}{/if}</span>
        <button class="icon" onclick="{handleTansfer}"><IconTransfer></IconTransfer></button>

    </div>

    {#if $token_state == "transfer"}

        <form class="token_form" onsubmit={transfer}>
    
            <select 
                id='to' 
                name='to'
                onchange={(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => showCustomAddress.set(e.currentTarget.value === '0x0000000000000000000000000000000000000000')}>
                <option value="..">to ..?</option>   
                {#each $contacts as contact}
                    <option value="{contact.objectAvatar}">{contact.objectName}</option>   
                {/each}
                <option value="0x0000000000000000000000000000000000000000">other</option>
            </select>
            {#if $showCustomAddress}
                <input id="to" name="to" type="text" placeholder="add recipient address here" />
            {/if}
            <input id="amount" name="amount" type="number" step="0.00001" min="0" placeholder="amount"/>
            <button class="pill" type="submit">Transfer</button>
        </form>

    {:else if $token_state == "spinner"}

        <SpinnerWaveHuge></SpinnerWaveHuge>

    {/if}

</article>