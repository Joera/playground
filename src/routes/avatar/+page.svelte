<script lang="ts">

    import { safe_addresses, safe_store, waitForSafeStoreToBePopulated, waitForSubscriptions } from '$lib/safe.store';
    import { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import ProfileDisplay from '$lib/components/ProfileDisplay.svelte';
    import ProfileScanner from '$lib/components/ProfileScanner.svelte';
    import ProfileContacts from '$lib/components/ProfileContacts.svelte';
    import Spinner from '$lib/components/Spinner.svelte';
    import { getProfile } from '$lib/profile.factory';
    import ProfileActivities from '$lib/components/ProfileActivities.svelte';
    import { friend_address } from '$lib/contacts.store';
    import { avatar_state, contacts_state, profile_state } from '$lib/state.store';

    let safesWithAvatars: string[] = [];
    let srv: Writable<SafeService> = writable();

        avatar_state.set("profile");
    let profile : Writable<any> = writable({
        name: "",
        description: ""
    });
    let owner_address: Writable<string> = writable("");

    const handleProfile = async () => {
        avatar_state.set('profile');
    }

    const handleScanner = async () => {
        avatar_state.set('scanner');
    }

    const handleContacts = async () => {  
        contacts_state.set("");
        avatar_state.set('contacts');
    }

    const handleInviteRequested = async (event: any) => {
        friend_address.set(event.detail);
        avatar_state.set('profile');
    }

    const handleInviteApproved = async (event: any) => {
        avatar_state.set('contacts');
    }

    const handleActivities = async () => {
        avatar_state.set('activities');
    }

    onMount(async () => {

        profile_state.set("spinner");

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

        if ($srv) {
            profile.set(     
                await getProfile($srv)
            );
        }
    })


</script>

<article>

    

    {#if $avatar_state == 'profile'}

    <h2>circles avatar</h2>

        <ProfileDisplay profile={profile} owner_address={owner_address} friend_address={friend_address}></ProfileDisplay>

    {:else if $avatar_state == 'scanner'}

    <h2>circles scanner</h2>

        <ProfileScanner on:invite_success_event={handleInviteApproved}></ProfileScanner>

    {:else if $avatar_state == 'contacts'}

    <h2>circles contacts</h2>

        <ProfileContacts on:friend_address_event={handleInviteRequested}></ProfileContacts>

    {:else if $avatar_state == 'activities'}

    <h2>circles activities</h2>

        <ProfileActivities></ProfileActivities>

    {:else if $avatar_state == 'spinner'}

        <Spinner></Spinner>

    {/if}
    

    <nav>
        <button class="button" on:click="{handleProfile}">profile</button>
        <button class="button" on:click="{handleScanner}">scan</button>
        <button class="button" on:click="{handleContacts}">contacts</button>
        <button class="button" on:click="{handleActivities}">activity</button>
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