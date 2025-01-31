<!-- src/components/SafeOverview.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { SafeService } from '$lib/safe.service';
    import { derived, get, writable, type Writable } from 'svelte/store';
    import { tokenList, type IToken } from '$lib/factory/token.factory';
    import SpinnerWave from './SpinnerWave.svelte';
    import TokenErc20 from './TokenERC20.svelte';
    import TokenCircle from './TokenCircle.svelte';
    import { circlesStore } from '$lib/store/contacts.store';
   
    export let safeSrv: Writable<SafeService>;

    // Reactive values
    $: signer_address = $safeSrv.signer_address;
    $: signers = $safeSrv.signers;
    $: tokens = JSON.parse(JSON.stringify(tokenList[$safeSrv.chain]))
        
    const state = writable("pre");
    const deployed = writable(false);

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

    const handleMintBaseNFT = async () => {
        state.set("spinner");
        $safeSrv.mintNFT();
        state.set("");
    }

    safeSrv.subscribe( async (srv: SafeService) => {
        deployed.set(await srv.getDeployed());
    })

    onMount(async () => {
        
        state.set("");

        if ($safeSrv.chain == "gnosis") {
            await get($safeSrv.circles)?.getContacts();
            await get($safeSrv.circles)?.updateBalances();
        }
    });

</script>

<article>
    <div class="safe_container">

        {#if $state == "spinner"} 

            <SpinnerWave></SpinnerWave>

        {:else}

            <div class="tokens">
                {#each tokens as token}
                    <TokenErc20 safeSrv={safeSrv} token={token}></TokenErc20>   
                {/each}
            </div>
            <div class="circles">
                {#each Array.from($circlesStore.values()) as token}
                    <TokenCircle safeSrv={safeSrv} token={token} ></TokenCircle>
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
                margin: 1.5rem 0;
                width: 100%;
            }

            .circles {
                margin: 1.5rem 0;
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
