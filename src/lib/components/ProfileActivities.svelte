<script lang="ts">
    import { goto } from "$app/navigation";
    import { displayAddress, fixSafeAddress } from "$lib/eth.factory";
    import { writable, type Writable } from "svelte/store";
    import { createEventDispatcher } from 'svelte';
    import { circles_addresses, safe_addresses, safe_store } from "$lib/safe.store";
    import { activities } from "$lib/activities.store";
    import { ethers, EtherscanPlugin } from "ethers";

    const dispatch = createEventDispatcher();

    const avatar_events: Writable<any[]> = writable([]);
    const avatar_trust_events: Writable<any[]> = writable([]);

    type Activity = {
        
        // attoCircles: number,
        // attoCrc: number,
        batchIndex: number,
        blockNumber:  number,
        circles: number,
        crc: number,
        from: string,
        id: string,
        logIndex: number,
        operator: string,
        // staticAttoCircles: number,
        staticCircles: number,
        timestamp: number,
        to: string,
        tokenType: string,
        transactionHash: string,
        transactionIndex: number,
        type: string,
        value: string,
        version: number
        toName?: string
    }


    const activity: Writable<Activity[]> = writable([])

    // prefill from local storage
    activities?.subscribe((activities) => {
        if (activities != "") {
            activity.set(JSON.parse(activities))
        }
    })

    circles_addresses.subscribe((addresses) => {
        
        const srv = $safe_store[addresses[0]];
        
        srv.subscribe(  async (srv) => {

            const txs_query = await srv.getCircleTxs();

            const txs = [];
            while (await txs_query.queryNextPage()) {
                const resultRows = txs_query.currentPage?.results ?? [];
                if (resultRows.length === 0)
                    break;
                txs.push(...resultRows);
                if (resultRows.length < 1000)
                    break;
            }

            // console.log(txs);

            for (let tx of txs) {

                delete tx.attoCircles;
                delete tx.attoCrc;
                delete tx.staticAttoCircles;
                
                if (tx.to != "0x0000000000000000000000000000000000000000" && ethers.getAddress(tx.to) != $circles_addresses[0]){  
                    tx.toName = await srv.getAvatarName(tx.to)
                }

                else if (ethers.getAddress(tx.from) == $circles_addresses[0] && tx.to == "0x0000000000000000000000000000000000000000" && tx.circles == 96) {
                    tx.toName = await srv.getAvatarName(tx.operator)
                }

                else if (ethers.getAddress(tx.to) == $circles_addresses[0]) {
                    tx.toName = await srv.getAvatarName(tx.to)
                }

            }

            activity.set(txs);  
            activities?.set(JSON.stringify(txs));
            
        });
    });

    const formatDate = (timestamp:  number) => {

        const date = new Date(timestamp * 1000);

        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    }

</script>

<section class="scrolltainer">

<article>

    {#each $activity as a}

        <div> 

            <div class="activity_top">
                <span>{ formatDate(a.timestamp) }</span>
            </div>
            <div class="activity_bottom">
                {#if a.type == "CrcV2_TransferSingle" } 

                    {#if a.from == "0x0000000000000000000000000000000000000000" && ethers.getAddress(a.to) == $circles_addresses[0]}
                        <span>minted</span>
                        <span> { '+' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == $circles_addresses[0] && a.to == "0x0000000000000000000000000000000000000000" && a.circles == 96}
                        <span>onboarded {a.toName}</span> 
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == $circles_addresses[0] && a.to == "0x0000000000000000000000000000000000000000"}
                        <span>taxes</span>
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.from) == $circles_addresses[0]}
                        {#if a.toName}
                            <span>to: {a.toName}</span>
                        {:else}
                            <span>to: {'.' + a.to.slice(a.to.length - 5, a.to.length -1)}</span>
                        {/if}
                        <span> { '-' + a.circles.toFixed(2) }</span>
                    {:else if ethers.getAddress(a.to) == $circles_addresses[0]}
                        {#if a.toName}
                            <span>from: {a.toName}</span>
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
    
    .scrolltainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        position: relative;
        height: 100%;
        overflow-y: scroll;
        width: 100%;
        max-width: 420px;
        margin: 3rem 0;
    }

    article {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        width: 100%;
        max-width: calc(100% - 4rem);
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