<script lang="ts">
    import { goto } from "$app/navigation";
    import { avatar_store, circles_sdk_store } from "$lib/avatar.store";
    import { displayAddress } from "$lib/eth.factory";
    import { CirclesData, CirclesRpc } from "@circles-sdk/data";
    import { writable, type Writable } from "svelte/store";
    import { createEventDispatcher } from 'svelte';
    import { safe_addresses } from "$lib/safe.store";


    const circlesRpc = new CirclesRpc("https://rpc.aboutcircles.com");
    const data = new CirclesData(circlesRpc);

    const dispatch = createEventDispatcher();

    const avatar_events: Writable<any[]> = writable([]);

    const handleInvite = async (friend_adress:string) => {
       
        dispatch('friend_address_event', friend_adress);
    }

    const getEvents = async () => {

        avatar_store.subscribe(async (store) => {

            const address = Object.keys(await store)[0]
            const avatarEvents = await data.getEvents(address, 10000000);
            avatar_events.set(avatarEvents);
        })
    }

    getEvents();

</script>


<article>

    {#each $avatar_events as event}
            <div class="event">
              
                {#if event.$event == "CrcV2_Trust" &&  $safe_addresses.includes(event.trustee) && event.truster != event.trustee}
                    <div>
                        { displayAddress("gno", event.truster) } trusts you
                    </div>
                    {#if Object.values($avatar_store)[0] == null}
                        <button on:click={() => handleInvite(event.truster)}>join circles</button>
                    {/if}
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
            margin-top: 1.5rem;
        }
    }



</style>