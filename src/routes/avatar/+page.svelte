<script lang="ts">
    import QRCode from '@castlenine/svelte-qrcode';

    import { safe_addresses, safe_store } from '$lib/safe.store';
    import { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { on } from 'svelte/events';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let owner_address = '';
    let safesWithAvatars: string[] = [];
    let srv: Writable<SafeService> = writable();

    const handleInvite = async () => {
        
        goto('/avatar/scan');
    }

    async function waitForSubscriptions() {

        console.log("len: " + Object.keys($safe_store).length);
        for (const safe of Object.keys($safe_store)) {
            let b = await new Promise(resolve => {
                $safe_store[safe].subscribe(async (safeService) => {
                    const hasAvatar = await safeService.hasAvatar();
                    resolve(hasAvatar);
                });
            });
            console.log(b)
            if (b) {
                safesWithAvatars.push(safe);
            }
        }
    }

    function waitForSafeStoreToBePopulated() : Promise<void> {
        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const safes = Object.keys($safe_store);
                if (safes.length === $safe_addresses.length) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);
        });
    }

    onMount(async () => {

        await waitForSafeStoreToBePopulated();
        await waitForSubscriptions();

        console.log(safesWithAvatars);

        if (safesWithAvatars.length == 0) {

            // new 
            console.log(1);

        } else {

            console.log(2);
            srv = $safe_store[safesWithAvatars[0]];
            if ($srv) {
                owner_address = $srv.safe_address;
            }
        }
        
    })

    

// check if is attached to safe 
// usable safes? 
// select safe 
</script>

<style>
    article {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }
</style>



<article>

    <h1>Avatar</h1>
    {#if owner_address != ""}
        <QRCode data="{owner_address}" />
    {/if}


    <button on:click="{handleInvite}">invite</button>

</article>