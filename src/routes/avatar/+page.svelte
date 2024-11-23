<script lang="ts">

    import { safe_addresses, safe_store, waitForSafeStoreToBePopulated, waitForSubscriptions } from '$lib/safe.store';
    import { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import ProfileDisplay from '$lib/components/ProfileDisplay.svelte';
    import ProfileForm from '$lib/components/ProfileForm.svelte';
    import ProfileScanner from '$lib/components/ProfileScanner.svelte';
    import ProfileContacts from '$lib/components/ProfileContacts.svelte';
    import Spinner from '$lib/components/Spinner.svelte';
    import { avatar_store } from '$lib/avatar.store';

    let safesWithAvatars: string[] = [];
    let srv: Writable<SafeService> = writable();

    let isTrusted = writable(false);
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

    const handleInviteRequested = async (event: any) => {
        console.log(event);
        friend_address.set(event.detail);
        state.set('edit');
    }

    const handleInviteApproved = async (event: any) => {
        state.set('contacts');
    }

    onMount(async () => {

        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses); 
        await waitForSubscriptions($safe_store, safesWithAvatars);

        if (safesWithAvatars.length == 0) {

            if (safe_addresses != undefined) {
                owner_address.set($safe_addresses[0]);
                srv = $safe_store[$safe_addresses[0]]; 
            }

        } else {

            srv = $safe_store[safesWithAvatars[0]];
            if ($srv) {
                owner_address.set($srv.safe_address);
            }
        }

        avatar_store.subscribe(async (_astore) => {
 
           const circlesSdk = Object.values(await _astore)[0];
           const p = await circlesSdk.getProfile();
           console.log(p)
           profile.set(p)

        //    const avatarEvents = await circlesSdk.data.subscribeToEvents($srv.safe_address);
        //         avatarEvents.subscribe((event: any) => {
        //         console.log(event);
        //     });
        });

        
    })


</script>

<article>

    <h2>circles avatar</h2>

    {#if $state == 'profile'}

        <ProfileDisplay profile={$profile} owner_address={$owner_address}></ProfileDisplay>

    <!-- {:else if $state == 'edit'}

        <ProfileForm profile={$profile} friend_address={$friend_address}></ProfileForm> -->

    {:else if $state == 'scanner'}

        <ProfileScanner on:invite_success_event={handleInviteApproved}></ProfileScanner>

    {:else if $state == 'contacts'}

        <ProfileContacts on:friend_address_event={handleInviteRequested}></ProfileContacts>

    {:else if $state == 'spinner'}

        <Spinner></Spinner>

    {/if}
    

    <nav>
        <button class="button" on:click="{handleProfile}">profile</button>
        <!-- <button class="button" on:click="{handleEdit}">edit</button> -->
        <button class="button" on:click="{handleScanner}">scanner</button>
        <button class="button" on:click="{handleContacts}">contacts</button>
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