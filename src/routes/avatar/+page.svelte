<script lang="ts">
    import QRCode from '@castlenine/svelte-qrcode';

    import { safe_addresses, safe_store } from '$lib/safe.store';
    import { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { on } from 'svelte/events';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import ProfileDisplay from '$lib/components/ProfileDisplay.svelte';
    import ProfileForm from '$lib/components/ProfileForm.svelte';
    import ProfileScanner from '$lib/components/ProfileScanner.svelte';
    import ProfileContacts from '$lib/components/ProfileContacts.svelte';


    let safesWithAvatars: string[] = [];
    let srv: Writable<SafeService> = writable();

    let state = writable("profile");
    let profile : Writable<any> = writable(null);
    let owner_address: Writable<string> = writable("");
    let friend_address: Writable<string> = writable("");

        

    

    const handleProfile = async () => {
        
        state.set('profile');
    }

    const handleEdit = async () => {
        
        state.set('edit');
    }

    const handleScanner = async () => {
        
        state.set('scanner');
    }

    const handleContacts = async () => {
        
        state.set('contacts');
    }

    const handleInvite = async (event: any) => {
        console.log(event);
        friend_address.set(event.detail);
        state.set('edit');
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

        if (safesWithAvatars.length == 0) {

          
            if(safe_addresses != undefined) {
                console.log("hello " + $safe_addresses[0]);
                owner_address.set($safe_addresses[0]);
                srv = $safe_store[$safe_addresses[0]]; 
            }

        } else {

            srv = $safe_store[safesWithAvatars[0]];
            if ($srv) {
                owner_address.set($srv.safe_address);
            }
        }
        
    })


</script>

<article>

    <h2>circles avatar</h2>

    {#if $state == 'profile'}

        <ProfileDisplay profile={$profile} owner_address={$owner_address}></ProfileDisplay>

    {:else if $state == 'edit'}

        <ProfileForm profile={$profile} friend_address={$friend_address}></ProfileForm>

    {:else if $state == 'scanner'}

        <ProfileScanner></ProfileScanner>

    {:else if $state == 'contacts'}

        <ProfileContacts on:friend_address_event={handleInvite}></ProfileContacts>

    {/if}
    

    <nav>
        <button on:click="{handleProfile}">profile</button>
        <button on:click="{handleEdit}">edit</button>
        <button on:click="{handleScanner}">scanner</button>
        <button on:click="{handleContacts}">contacts</button>
    </nav>

</article>

<style>
    article {
        position: relative;
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        div {

            display: flex;
            width: 100%;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
        }

        nav {
            /* align-self: flex-end; */
            /* margin: auto 0 0 0; */
        }
        
    }


</style>