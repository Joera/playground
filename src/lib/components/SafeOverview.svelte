<!-- src/components/SafeOverview.svelte -->
<script lang="ts">
    import { roundBalance} from '$lib/factory/eth.factory.js';
    import { onMount } from 'svelte';
    import type { SafeService } from '$lib/safe.service';
    import { derived, writable, type Writable } from 'svelte/store';
    import { tokenList, type IToken } from '$lib/factory/token.factory';
    import SpinnerWave from './SpinnerWave.svelte';
    import TokenErc20 from './TokenERC20.svelte';
    import TokenCircle from './TokenCircle.svelte';
    import Circles from './Circles.svelte';
    import { findSrvByChain } from '$lib/store/safe.store';
    import { ethers } from 'ethers';
    import { uint256ToAddress } from "@circles-sdk/utils";
   
    export let safeSrv: Writable<SafeService>;

    // Reactive values
    $: chain = $safeSrv.chain
    $: signer_address = $safeSrv.signer_address;
    $: version = $safeSrv.version;
    // $: tokens = $safeSrv.tokens;
    $: circles = $safeSrv.circles;
    $: signers = $safeSrv.signers;
    $: modules = $safeSrv.modules;
    $: tokens = JSON.parse(JSON.stringify(tokenList[$safeSrv.chain]))
    $: contacts = $safeSrv.contacts;
    $: mergedStore = derived(
        [circles, contacts],
        ([$circles, $contacts]) => {

            // console.log($circles);

            const circlesValues = Array.from($circles.values());
            
            // const contactEntries = Array.from($contacts.entries());
            // console.log(contactEntries);
            // return contactEntries.map(([address, contactData]) => {

            return $contacts.map((contact) => {

                const matchingCircle = circlesValues.find((circle) => {
                    
                    // console.log(circle.issuerAddress, contact.objectAvatar);
                    return circle.issuerAddress == contact.objectAvatar
                });

                if (matchingCircle != undefined) {
                    
                    return {
                        ...contact,
                        ...matchingCircle,
                        address: contact.objectAvatar
                    }
                } else {
                    return {
                        ...contact,
                        address: contact.objectAvatar,
                        balance: 0
                    }
                }
                
            }).sort((a, b) => {
                if (a.balance > b.balance) return -1;
                if (a.balance < b.balance) return 1;
                return 0;
            })
                // const contact_address = uint256ToAddress(address);

                // console.log("ca",contact_address)
                // const matchingCircle = $circles.find((circle) => circle.objectAvatar === contact_address);
                // console.log(matchingCircle, contact_address);
                // return matchingCircle != undefined
                //     ? { ...contactData, ...matchingCircle, address: contact_address }
                //     : { ...contactData, address: contact_address };
        }
    );
         
        // ([$circles, $contacts]) => {
             
        //     const circleEntries = Array.from($circles.entries());

        //     return circleEntries.map(([address, circleData]) => {
        //     const matchingContact = $contacts.find((contact) => contact.address === address);
        //     return matchingContact
        //         ? { ...circleData, ...matchingContact, address }
        //         : { ...circleData, address };
        //     });
        // }
    // );

    const state = writable("pre");
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
    //    state.set("spinner");
      //  await waitForSafeStoreToBePopulated($safe_store, $safe_addresses);
        state.set("");

        
        

        if ($safeSrv.chain == "gnosis") {
            await $safeSrv.getContacts();
            await $safeSrv.getCircles();
            // console.log($circles)
            // console.log($contacts)
            console.log($mergedStore)
            
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
                {#if $safeSrv.chain == "gnosis" && $state == ""}
                    <Circles circles={circles} srv={safeSrv}></Circles>
                {/if}
                {#each $mergedStore as contact}
                    <TokenCircle safeSrv={safeSrv} contact={contact} ></TokenCircle>
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
