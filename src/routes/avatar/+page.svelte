<script lang="ts">

    import { findSrvByChain, safe_addresses, safe_store, waitForSafeStoreToBePopulated } from '$lib/store/safe.store';
    import { get, writable, type Writable } from 'svelte/store';
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

    avatar_state.set("profile");
    let profile : Writable<any> = writable({
        name: "",
        description: ""
    });

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

        const srv = await findSrvByChain("gnosis");
        if (srv) {
            if (await get(srv.circles).isHuman() != "false") {
                profile_state.set("edit");
            }
        }
    }

    // const handleInviteApproved = async (event: any) => {
    //     avatar_state.set('contacts');
    // }

    const handleActivities = async () => {
        avatar_state.set('activities');
    }

    onMount(async () => {

        // profile_state.set("spinner");

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

        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses); 
        const srv = await findSrvByChain("gnosis");
        if (srv) {
            if (await srv.getDeployed()) {
                const p = await getProfile(srv);
                profile.set(p);
                profile_store?.set(JSON.stringify(p));
                profile_state.set("");
            } else if (await get(srv.circles).isHuman() != "false") {
                profile_state.set("edit");
            }
        }
    })


</script>

<article>

    {#if $avatar_state == 'profile'}

    <h2>circles avatar</h2>

        <ProfileDisplay profile={profile} friend_address={friend_address}></ProfileDisplay>

    <!-- {:else if $avatar_state == 'scanner'}

    <h2>circles scanner</h2>

        <ProfileScanner on:invite_success_event={handleInviteApproved}></ProfileScanner> -->

    {:else if $avatar_state == 'contacts'}

    <h2>circles contacts</h2>

        <ProfileContacts on:friend_address_event={handleInviteRequested}></ProfileContacts>

    {:else if $avatar_state == 'activities'}

    <h2>circles activities</h2>

        <ProfileActivities></ProfileActivities>

    {:else if $avatar_state == 'spinner'}

        <Spinner></Spinner>

    {/if}
    

    <nav class="sub">
        <button class="pill narrow" on:click="{handleProfile}">profile</button>
      
        <button class="pill narrow" on:click="{handleContacts}">contacts</button>
        <button class="pill narrow" on:click="{handleActivities}">activity</button>
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