<script lang="ts">
    import { goto } from "$app/navigation";
    import { displayAddress, fixSafeAddress } from "$lib/factory/eth.factory";
    import { writable, type Writable } from "svelte/store";
    import { createEventDispatcher, onMount } from 'svelte';
    import { findAddressByChain, findSrvByChain, parseSafeAddress, safe_addresses, safe_store, waitForSafeStoreToBePopulated } from "$lib/store/safe.store";
    import { activities } from "$lib/store/activities.store";
    import { ethers, EtherscanPlugin } from "ethers";
    import SpinnerWave from "./SpinnerWave.svelte";
    import { activity_state } from "$lib/store/state.store";
    import { fetchActivities, formatDate } from "$lib/factory/activities.factory";

    const dispatch = createEventDispatcher();

    const avatar_events: Writable<any[]> = writable([]);
    const avatar_trust_events: Writable<any[]> = writable([]);

    type Activity = {
        

        batchIndex: number,
        blockNumber:  number,
        circles: number,
        crc: number,
        from: string,
        id: string,
        logIndex: number,
        operator: string,
        staticCircles: number,
        timestamp: number,
        to: string,
        tokenType: string,
        transactionHash: string,
        transactionIndex: number,
        type: string,
        value?: string,
        version?: number
        toName?: string
        fromName?: string
    }

    const activity: Writable<Activity[]> = writable([])

    $: safe_address = "";

    onMount(async () => {

        const prefixed_address = await findAddressByChain("gnosis") || "";
        const { chain, address } = parseSafeAddress(prefixed_address);
        safe_address = address;
        
        activities?.subscribe((activities) => {
        if (activities != "") {
            activity.set(JSON.parse(activities))
        }
        })

        if($activity.length < 1) {
            activity_state.set("spinner");
        }

        fetchActivities().then((_activities) => {
            activities?.set(JSON.stringify(_activities));
            activity.set(_activities);
            activity_state.set("");
        });
    })

    

</script>

<section class="scrolltainer">

<article>


    {#if $activity_state == 'spinner'}
        <SpinnerWave></SpinnerWave>
    {/if}

    {#each $activity as a}

        <div> 

            <div class="activity_top">
                <span>{ formatDate(a.timestamp) }</span>
            </div>
            <div class="activity_bottom">
                {#if a.type == "CrcV2_TransferSingle" } 

                    {#if a.from == "0x0000000000000000000000000000000000000000" && ethers.getAddress(a.to) == safe_address}
                        <span>minted</span>
                        <span> { '+' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == safe_address && a.to == "0x0000000000000000000000000000000000000000" && a.circles == 96}
                        <span>onboarded {#if a.toName}{a.toName}{:else}..{a.operator.slice(a.to.length - 5, a.to.length -1)}{/if}</span> 
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == safe_address && a.to == "0x0000000000000000000000000000000000000000"}
                        <span>taxes</span>
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == safe_address}
                        {#if a.toName}
                            <span>to: {a.toName}</span>
                        {:else}
                            <span>to: {'.' + a.to.slice(a.to.length - 5, a.to.length -1)}</span>
                        {/if}
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.to) == safe_address}
                        {#if a.fromName}
                            <span>from: {a.fromName}</span>
                        {:else}
                            <span>from: {'.' + a.to.slice(a.to.length - 5, a.to.length -1)}</span>
                        {/if}
                        <span> { '+' + a.circles.toFixed(2) }</span>
                    {/if}
                {:else if a.type == "CrcV1_Transfer"}
                    
            
                        <span>migration from CRCV1</span> <span> { a.circles.toFixed(2) }</span>
                {/if}   
            </div>
        </div>

    {/each}


</article>

</section>

<style>
    


    article {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        width: 100%;
        max-width: calc(100% - 4rem);
        margin-top: 3rem;
        height: 100%;
        /* min-height: 100%; */
        

        > div {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            height: 3.5rem;
            padding: .5rem 0;
            width: 100%;
            border-bottom:  3px solid black;
        }

        .activity_bottom {

            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .activity_top {

            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }
    }

    .name {
        line-height: 1.125;
        margin-right: 15px;
    }



</style>