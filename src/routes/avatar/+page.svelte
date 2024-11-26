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
    import { hexStringToUint8Array, uint8ArrayToCidV0 } from '@circles-sdk/utils';
    import { ipfs_cat } from '$lib/ipfs.factory';

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

    const handleActivities = async () => {
        state.set('activities');
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

        // get profile cid
        const abi = [
                        {
                    type: "function",
                    name: "getMetadataDigest",
                    inputs: [
                        {
                            name: "_avatar",
                            type: "address",
                            internalType: "address",
                        },
                    ],
                    outputs: [
                        {
                            name: "",
                            type: "bytes32",
                            internalType: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                }
        ];

        const nameRegistryAddress = "0xA27566fD89162cC3D40Cb59c87AAaA49B85F3474"
        let hex = await $srv.genericCall(nameRegistryAddress, abi, "getMetadataDigest", [$srv.safe_address]);
        hex = hex.startsWith("0x") ? hex.slice(2) : hex;
        let profile_cid  = uint8ArrayToCidV0(hexStringToUint8Array(hex));

        let _profile = null;

        try {
           _profile = await ipfs_cat(profile_cid);

        } catch (error) {

            console.log(error)
        }

        let p;
        if (_profile == null || _profile == undefined) {
            p = {
                    name: "",
                    description: ""
                }
        } else {

            p = _profile
        }

        profile.set(p);

        // get cid content 

        // avatar_store.subscribe(async (_astore) => {
 
        //    const circlesSdk = Object.values(await _astore)[0];

        //    

        //    try {
        //         p = await circlesSdk.getProfile();

        //    } catch (error) {}

        //    if (p == null || p == undefined) {
        //         p = {
        //             name: "",
        //             description: ""
        //         }
        //     }

        //    profile.set(p);
           
       
        // //    const avatarEvents = await circlesSdk.data.subscribeToEvents($srv.safe_address);
        // //         avatarEvents.subscribe((event: any) => {
        // //         console.log(event);
        // //     });
        // });

        
    })


</script>

<article>

    <h2>circles avatar</h2>

    {#if $state == 'profile'}

        <ProfileDisplay profile={$profile} owner_address={$owner_address} friend_address={$friend_address}></ProfileDisplay>

    {:else if $state == 'scanner'}

        <ProfileScanner on:invite_success_event={handleInviteApproved}></ProfileScanner>

    {:else if $state == 'contacts'}

        <ProfileContacts on:friend_address_event={handleInviteRequested}></ProfileContacts>

    {:else if $state == 'activities'}

        <ProfileContacts on:friend_address_event={handleInviteRequested}></ProfileContacts>

    {:else if $state == 'spinner'}

        <Spinner></Spinner>

    {/if}
    

    <nav>
        <button class="button" on:click="{handleProfile}">profile</button>
        <button class="button" on:click="{handleScanner}">scan</button>
        <button class="button" on:click="{handleContacts}">network</button>
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