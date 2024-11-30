<script lang="ts">
    import { displayAddress } from "$lib/eth.factory";
    import { circles_addresses, safe_store } from "$lib/safe.store";
    import { writable, type Writable } from "svelte/store";

    type Contact = {
        objectAvatar: string;
        relation: string;
        subjectAvatar: string;
    }

    const network: Writable<Contact[]> = writable([])

    circles_addresses.subscribe((addresses) => {
        
        const srv = $safe_store[addresses[0]];

        srv.subscribe(  async (srv) => {
            
            network.set(await srv.getNetwork())

            console.log($network);
            
        });
    })
    



</script>

<article>

    {#each $network as contact}
        <div>
            {displayAddress("gno", contact.objectAvatar)} - {contact.relation} - {displayAddress("gno",contact.subjectAvatar)})
        </div>
    {/each}

</article>

<style>

    article {
        display: flex;
        flex-direction: column;
        align-items: center;            
        justify-content: flex-start;
        max-width: calc(100% - 4rem);
    }

</style>