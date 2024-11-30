<script lang="ts">
    import { goto } from "$app/navigation";
    import { displayAddress, fixSafeAddress } from "$lib/eth.factory";
    import { CirclesData, CirclesRpc } from "@circles-sdk/data";
    import { writable, type Writable } from "svelte/store";
    import { createEventDispatcher } from 'svelte';
    import { circles_addresses, safe_addresses, safe_store } from "$lib/safe.store";
    import { LOG } from "@zxing/library/esm/core/datamatrix/encoder/constants";




    const dispatch = createEventDispatcher();

    const avatar_events: Writable<any[]> = writable([]);
    const avatar_trust_events: Writable<any[]> = writable([]);

    const handleInvite = async (friend_adress:string) => {
       
        dispatch('friend_address_event', friend_adress);
    }

    const getEvents = async () => {

        circles_addresses.subscribe(async (addresses: string[]) => {
            safe_store.subscribe(async (store) => {
                (await store)[addresses[0]].subscribe(async (srv) => {

                    const avatarEvents: any[] = await srv.circles_data.getEvents(addresses[0], 10000000);
                
                    avatar_trust_events.set(

                        avatarEvents
                        .filter((event) => event.$event == "CrcV2_Trust")
                        .filter((item, index, array) => {
                            const pair = `${item.trustee}-${item.truster}`;
                            return index === array.findIndex(i => `${i.trustee}-${i.truster}` === pair);
                        })
                        .filter((event) => $safe_addresses.includes(fixSafeAddress(event.trustee|| "")))
                    );
                    
                    avatar_events.set(avatarEvents);

                })
            })
        })
    }

    getEvents();

</script>


<article>

    {#each $avatar_trust_events as event}

         
            <div class="event">

                    <div>
                        { displayAddress("gno", fixSafeAddress(event.truster)) } trusts you
                    </div>
                    {#if $circles_addresses[0] == undefined}
                        <button class="button"on:click={() => handleInvite(fixSafeAddress(event.truster))}>join circles</button>
                    {/if}
             
            </div>
    {/each}

</article>

<style>
    .event { 

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;


        > div  {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            /* > div {
                margin: 0 1rem; 
            } */
        }

        button {
            margin-top: .5rem;
            margin-bottom: 1.5rem;
        }
    }



</style>