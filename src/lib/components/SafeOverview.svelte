<!-- src/components/SafeOverview.svelte -->
<script lang="ts">
    import { displayAddress, displaySafeAddress, roundBalance } from '$lib/eth.factory.js';
    import { onMount } from 'svelte';
    import type { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import type { IToken } from '$lib/token.factory';
    import Spinner from './Spinner.svelte';

    export let safe_address: string;
    export let safeSrv: Writable<SafeService>;

    // Reactive values
    $: signer_address = $safeSrv.signer_address;
    $: version = $safeSrv.version;
    $: deployed = $safeSrv.deployed;
    $: tokens = $safeSrv.tokens;
    $: circles = $safeSrv.circles;
    $: signers = $safeSrv.signers;
    $: modules = $safeSrv.modules;

    const state = writable("");
    const tokenId = writable("");
    const tokenBalance = writable(0);
    const mintable = writable(0);

    // Optionally, fetch initial data on mount if needed
    onMount(async () => {

        safeSrv.subscribe((srv: SafeService) => {
            srv.getVersion();
        })
    });

    const handleUpgrade = async () => {
        safeSrv.subscribe((srv: SafeService) => {
            srv.upgrade();
        })
    };

    const handleAccessRequest  = async () => {
        safeSrv.subscribe((srv: SafeService) => {
            srv.requestAccess();
        })
    };

    const handleEnableModule = async () => {
        safeSrv.subscribe((srv: SafeService) => {
            srv.addAcountAbstractionModule();
        })
    }

    const handleMint = async () => {
        safeSrv.subscribe( async (srv: SafeService) => {
            state.set("spinner");
            await srv.mintCircles();
            // display link to tx on scan? (txs page?? )
            await srv.getCircles();
            state.set("token");
            
        })
    }

    const handleTansfer = async () => {
        safeSrv.subscribe( async (srv: SafeService) => {
            await srv.mintCircles();

            const to = "0x0000000000000000000000000000000000000000";
            const id = "0x0000000000000000000000000000000000000000";
            const value = 1;
            srv.transferCircles(to,id,value);
        })
    }

    const handleCirclesInfo = async (id: string, token: IToken) => {
        tokenId.set(id);
        tokenBalance.set(parseFloat(token.balance));
        if (token.mintable != undefined && parseFloat(token.mintable) > 0) {
            mintable.set(parseFloat(token.mintable));
        }
        state.set("token");
    }

    const handleTokenInfo = async (address: string, token: IToken) => {
        tokenId.set(address);
        tokenBalance.set(parseFloat(token.balance));
       
        state.set("token");
    }

    const handleBack = async () => {
        
        state.set("");
    }

</script>

<article>
    <div class="safe_container">


        {#if $state == "spinner"} 

            <Spinner></Spinner>

        {:else if $state == "token"} 

            <label>Balance: <span>{$tokenBalance.toFixed(2)}</span></label>  
            
            <button class="button">transfer</button>
            {#if $mintable > 0}
                <label>Mintable: <span>{$mintable.toFixed(2)}</span></label>   
                  
                <button class="button" on:click={handleMint}>mint</button>
            {/if}
            
            <button class="button" on:click={handleBack}>back</button>

        {:else}
            <label>Safe: <span>{$version}</span></label>

            <div class="address">
                <span>{ @html displaySafeAddress("gno", safe_address)}</span>
            </div>

            <div class="tokens">
                {#each $tokens.entries() as [address,token]}
                    <button class="token" on:click={() => handleTokenInfo(address, token)}>
                        <span>{token.symbol}</span>
                        <span>{roundBalance(token.balance)}</span>
                    </button>
                {/each}
                {#each $circles.entries() as [address,token]}
                    <button class="token" on:click={() => handleCirclesInfo(address, token)}>
                    
                            <span>CRC</span>
                            <span>{parseFloat(token.balance).toFixed(0)}{#if token.mintable > 1}+{parseFloat(token.mintable).toFixed(0)}{/if}
                        </span>
                       
                    </button>
                {/each}
            </div>
            {#if $deployed}
                {#if !$signers.includes($signer_address)}
                    <div>read only</div>
                {/if}
            {:else}
                <div>not yet deployed</div>
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
       
        {#if $version == "1.3.0"} 
            <button on:click={handleUpgrade}>upgrade</button>
        {/if}
        {#if !$modules.includes("0xa581c4A4DB7175302464fF3C06380BC3270b4037")}
            <button on:click={handleEnableModule}>enable AA</button>
        {/if}
    </div>
</article>

<style>
    article {
            display: flex;
            
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            margin: 1.5rem 0;

            > div  {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                /* width: 320px; */
                
            }
           

            /* > div.safe_container {
                min-height: 240px;
                border: 1px solid #000000;
                margin: 0 1.5rem;
                padding: 1.5rem .75rem;
            } */

            .tokens {
                margin: 1.5rem 0;
            }

            .token {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                min-width: 160px;
                /* margin: .25rem 0 */
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
