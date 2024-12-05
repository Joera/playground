<script lang="ts">
    import { goto } from "$app/navigation";
    import { events } from "$lib/store/event.store";
    import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher();

    const handleClick = (event: any) => {

        events?.subscribe((value) => {
            if (value != "") {
                const _events = JSON.parse(value);
                if (_events.length > 0) {
                    _events.pop();
                    events?.set(JSON.stringify(_events));
                }
            }
        })

        if (event.method == "accept_invite") {
            dispatch('friend_address_event', event.address);
        }
    }

</script>


<section class="ticker">

    {#if $events}
        {#each (JSON.parse($events)).reverse().slice(0,1) as event}
            <button on:click={ () => handleClick(event)}>
                <span class="event">{event.msg}</span>
            </button>
        {/each}
    {/if}

</section>


<style>

    .ticker:empty {
        display: none;
    }

    .ticker {
        position: fixed;
        top: auto;
        bottom: 3rem;
        left: 0;
        z-index: 1001;
        background: white;
        height: 2.8rem;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

       
    }

    button {
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    span.event {
            display: block;
            margin-left: 2rem;
        }

</style>