<script lang="ts">
    import { goto } from "$app/navigation";
    import { events } from "$lib/event.store";



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
        top: 0;
        left: 0;
        z-index: 1000;
        background: white;
        height: 2.8rem;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;

       
    }

    button {
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
    }

    span.event {
            display: block;
            margin-left: 2rem;
        }

</style>