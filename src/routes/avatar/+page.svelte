<script lang="ts">

    import { safe_addresses, safe_store, waitForSafeStoreToBePopulated, waitForSubscriptions } from '$lib/store/safe.store';
    import { SafeService } from '$lib/safe.service';
    import { writable, type Writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import ProfileDisplay from '$lib/components/ProfileDisplay.svelte';
    import ProfileScanner from '$lib/components/ProfileScanner.svelte';
    import ProfileContacts from '$lib/components/ProfileContacts.svelte';
    import Spinner from '$lib/components/Spinner.svelte';
    import { getProfile } from '$lib/factory/profile.factory';
    import ProfileActivities from '$lib/components/ProfileActivities.svelte';
    import { friend_address } from '$lib/store/contacts.store';
    import { avatar_state, contacts_state, profile_state } from '$lib/store/state.store';
    import { profile_store } from '$lib/store/profile.store';

    let safesWithAvatars: string[] = [];
    let srv: Writable<SafeService> = writable();

    avatar_state.set("profile");
    let profile : Writable<any> = writable({
        name: "",
        description: ""
    });
    let owner_address: Writable<string> = writable("");

    const handleProfile = async () => {
        profile_state.set("");
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

        profile_store?.subscribe(async (p) => {

            let _profile; 
            try {
                _profile = JSON.parse(p);
            } catch (error) {
                _profile = {}
            }

            if(_profile.name != "" && _profile.name != undefined) {
                profile.set(_profile);
                profile_state.set("");
            }
        })


        owner_address.set($safe_addresses[0])

        console.log(1);
        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses); 
        console.log(2);
        await waitForSubscriptions($safe_store, safesWithAvatars);
        console.log(3);

        srv = $safe_store["gnosis"];

        if ($srv) {
            if ($profile.name == "" || $profile.name == undefined) {
                const p = await getProfile($srv);
                profile.set(p);
                profile_store?.set(JSON.stringify(p));
                profile_state.set("");
            }
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
        justify-content: flex-start;
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