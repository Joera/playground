<!-- src/components/SafeOverview.svelte -->
<script lang="ts">
    import { roundBalance } from '$lib/factory/eth.factory.js';
    import { onMount } from 'svelte';
    import type { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { tokenList, type IToken } from '$lib/factory/token.factory';
    import SpinnerWave from './SpinnerWave.svelte';
    import { safe_addresses, safe_store, waitForSafeStoreToBePopulated } from '$lib/store/safe.store';
    import { ethers } from 'ethers';
    import { oft_abi } from '$lib/oft_abi';
    import { oftBridgeTx } from '$lib/factory/oft.factory';
    import TokenErc20 from './TokenERC20.svelte';
    import TokenCircle from './TokenCircle.svelte';
   
    export let safeSrv: Writable<SafeService>;

    // Reactive values
    $: chain = $safeSrv.chain
    $: signer_address = $safeSrv.signer_address;
    $: version = $safeSrv.version;
    $: tokens = $safeSrv.tokens;
    $: circles = $safeSrv.circles;
    $: signers = $safeSrv.signers;
    $: modules = $safeSrv.modules;


    const state = writable("");
    const deployed = writable(false);

    const tokenId = writable("");
    const tokenBalance = writable(0);
    
    
    // Optionally, fetch initial data on mount if needed
   

    const handleUpgrade = async () => {
        safeSrv.subscribe((srv: SafeService) => {
            srv.upgrade();
        })
    };


    const handleEnableModule = async () => {
        safeSrv.subscribe((srv: SafeService) => {
            srv.addAcountAbstractionModule();
        })
    }

    

    // const handleCirclesInfo = async (id: string, token: IToken) => {
    //     tokenId.set(id);
    //     tokenBalance.set(parseFloat(token.balance));
    //     if (token.mintable != undefined && parseFloat(token.mintable) > 0) {
    //         mintable.set(parseFloat(token.mintable));
    //     }
    //     state.set("token");
    // }

    // const handleTokenInfo = async (address: string, token: IToken) => {
    //     tokenId.set(address);
    //     tokenBalance.set(parseFloat(token.balance));
       
    //     state.set("token");
    // }

    // const handleBack = async () => {
    //     state.set("");
    // } 

    const handleMintBaseNFT = async () => {
        state.set("spinner");
        $safeSrv.mintNFT();
        state.set("");
    }

    safeSrv.subscribe( async (srv: SafeService) => {
        deployed.set(await srv.getDeployed());
    })
    
    onMount(async () => {
        state.set("spinner");
        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses);
        state.set("");
    });

</script>

<article>
    <div class="safe_container">

        {#if $state == "spinner"} 

            <SpinnerWave></SpinnerWave>

        {:else}

            <div class="tokens">
                {#each $tokens.entries() as [address,token]}
                    <TokenErc20 safeSrv={safeSrv} token={token}></TokenErc20>   
                {/each}
                {#each $circles.entries() as [address,token]}
                    <TokenCircle safeSrv={safeSrv} token={token} address={address}></TokenCircle>
                {/each}
            </div>
            {#if $deployed}
                {#if !$signers.includes($signer_address)}
                    <div>read only</div>
                {/if}
            {:else}
                {#if $safeSrv.provider == undefined}
                    <div>Provider unavailable</div>
                {:else}
                <div>not yet deployed</div>
                {/if}
                {#if $safeSrv.chain == "base" && $safeSrv.provider != undefined}
                    <button class="button" on:click={handleMintBaseNFT}>deploy</button>
                {/if}
            {/if}
        {/if}
        
        <!-- <div class="signers">
             {#each $signers as signer}
                <div>
                {displayAddress("gno",signer)}
                </div>
            {/each}
        </div> -->
        
    </div>
    <div class="actions">
       
        <!-- {#if $deployed && $version == "1.3.0"} 
            <button on:click={handleUpgrade}>upgrade</button>
        {/if}
        {#if  $deployed && !$modules.includes("0xa581c4A4DB7175302464fF3C06380BC3270b4037")}
            <button on:click={handleEnableModule}>enable AA</button>
        {/if} -->
    
    </div>
</article>

<style>
    article {

            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            /* margin: 1.5rem 0; */
            width: 100%;

            > div  {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                /* width: 320px; */
                
            }
           

        

            .tokens {
                margin: 0rem 0;
                width: 100%;
            }

      

            .signers {
                display: flex;
                flex-direction: column;
                align-items: center;
            }  

            .actions:not(:empty) {
              /*  margin: 1.5rem 0; */
                display: flex;
                flex-direction: column;
                align-items: center;



                button {
                    margin: .75rem 0;
                }
            } 
        }      

</style>
