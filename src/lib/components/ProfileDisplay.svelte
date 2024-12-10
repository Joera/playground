<script lang="ts">
    import QRCode from "@castlenine/svelte-qrcode";
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import SpinnerWave from "./SpinnerWave.svelte";
    import type { Profile } from "@circles-sdk/profiles";
    import { expiryTimeHex, fixSafeAddress } from "$lib/factory/eth.factory";
    import { circles_addresses, safe_addresses, safe_store } from "$lib/store/safe.store";
    import { cidV0ToUint8Array } from "@circles-sdk/utils";
    import { ipfs_add } from "$lib/factory/ipfs.factory";
    import { profile_state } from "$lib/store/state.store";
    import { HUBV2ADDRESS } from "$lib/constants";
    import { hubv2_abi } from "$lib/circles_hub_v2";
    import { profile_store } from '$lib/store/profile.store';

    export let profile: any;
    export let friend_address: Writable<string>;

    const handleProfile = async (event: any) => {

        profile_state.set('spinner');

        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());

        const newProfile: Profile = {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.image || "", 
        };

        const cid = await ipfs_add(newProfile);
        // console.log(cid);
        const hubv2Address = "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8";
        const nameRegistryAddress = "0xA27566fD89162cC3D40Cb59c87AAaA49B85F3474"

        const abi_hub = [
            {
                "inputs": [
                    { "internalType": "address", "name": "_inviter", "type": "address" },
                    { "internalType": "bytes32", "name": "_metadataDigest", "type": "bytes32" }
                ],
                "name": "registerHuman",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        const abi_nameregistry = [
            {
                type: "function",
                name: "updateMetadataDigest",
                inputs: [
                    {
                        name: "_metadataDigest",
                        type: "bytes32",
                        internalType: "bytes32",
                    },
                ],
                outputs: [],
                stateMutability: "nonpayable",
            }
        ];

        circles_addresses.subscribe(async (addresses) => {
        
            safe_store.subscribe(async (store) => {

                const safeService = (await store)["gnosis"];
            
                safeService.subscribe(async (srv) => {

                    const _metadataDigest:  Uint8Array = cidV0ToUint8Array(cid);
                    // console.log("friend", $friend_address)

                    if($friend_address != "" && friend_address != undefined) {
                        console.log("registering");
                        const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "registerHuman", [fixSafeAddress($friend_address), _metadataDigest], false);
                        console.log(r);
                        const s = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "trust", [fixSafeAddress($friend_address), expiryTimeHex()], false);
                        console.log(s);
                        friend_address.set("");
                    } else {
                        console.log("updating profile");
                        const r = await srv.genericTx(nameRegistryAddress, abi_nameregistry, "updateMetadataDigest", [_metadataDigest], false);
                        console.log(r);
                    }
                    profile_store?.set(JSON.stringify(newProfile));
                    profile_state.set("")
                })
            })
        });
    }

    const handleEdit = async () => {
        profile_state.set("edit");
    }

    // profile.subscribe((p: any) => {
    //     if (profile.name == "") {
    //         profile_state.set("edit");
    //     } else {
    //         profile_state.set("");
    //     }
    // });

    onMount(() => {

            
    });

</script>

<section class="scrolltainer">

    <article>

        {#if $profile_state == "spinner"} 

            <SpinnerWave></SpinnerWave>

        {:else if $profile_state == "edit" || $friend_address != ""}    

            <form id="profile" on:submit={handleProfile}>

                <label>
                    What is your name?
                    <input bind:value={$profile.name} type="text" name="name" id="name" placeholder="Name" />
                </label>
                <label>
                    What do you do?
                    <textarea bind:value={$profile.description} rows="3" name="description" id="name" placeholder="Description"></textarea> 
                </label>    
                            <!-- <label>
                                Image
                                <input type="text" name="image" id="name" placeholder="Image" />
                            </label> -->

                <button class="button" type="submit">submit</button>
            </form>

        {:else}

            {#if $profile.name != ""}
                <div id="profile"class="centered">
                    <h3>{$profile.name}</h3>
                    <p>{$profile.description}</p>
                </div>

                <!-- {#if $friend_address != ""} -->
                    <button class="icon edit" on:click={handleEdit} aria-label="edit">
                        <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 125"><g transform="translate(0,-952.36218)"><path style="text-indent:0;text-transform:none;direction:ltr;block-progression:tb;baseline-shift:baseline;color:#000000;enable-background:accumulate;" d="M 69 6 C 67.961908 6 66.948042 6.36436 66.15625 7.15625 L 12.59375 60.5625 A 2.0001999 2.0001999 0 0 0 12.03125 61.65625 L 7.03125 91.65625 A 2.0001999 2.0001999 0 0 0 9.34375 93.96875 L 37.34375 88.96875 A 2.0001999 2.0001999 0 0 0 38.4375 88.375 L 91.84375 33.625 L 91.84375 33.59375 C 92.318009 33.12067 93.000915 32.4995 93 31.28125 C 92.999075 30.0504 92.3477 29.47955 91.90625 29 L 71.875 7.21875 C 71.082071 6.35739 69.996801 6 69 6 z M 68.96875 10 C 68.96035 10.008 69.01575 10 69 10 L 88.5625 31.25 L 82.96875 37 L 63.3125 15.625 L 68.96875 10 z M 60.46875 18.46875 L 65.375 23.78125 L 21.71875 67.4375 L 16.78125 62.03125 L 60.46875 18.46875 z M 68.09375 26.71875 L 73.03125 32.125 L 29.40625 75.75 L 24.4375 70.375 L 68.09375 26.71875 z M 75.75 35.0625 L 80.15625 39.875 L 37.03125 84.09375 L 32.09375 78.71875 L 75.75 35.0625 z M 15.3125 66.34375 L 33.0625 85.6875 L 21.625 87.71875 L 13.28125 78.53125 L 15.3125 66.34375 z M 12.4375 83.53125 L 17 88.53125 L 11.4375 89.53125 L 12.4375 83.53125 z " transform="translate(0,952.36218)" fill="#000000" fill-opacity="1" stroke="none" visibility="visible" display="inline" overflow="visible"/></g></svg>
                        </button>
                <!-- {/if} -->
            {/if}

            {#if $safe_addresses[0] != "" && $safe_addresses[0] != undefined }
                <div class="centered">
                    {#if $friend_address == "" && $profile.name == ""}
                        <p>You are not yet trusted by circles to be a human. Ask a (new) friend to scan this and invite you. </p>
                    {/if}
                    <QRCode data="{$safe_addresses[0]}" backgroundColor="transparent" />
                </div>
            {/if}

        {/if}

    </article>

</section>

<style>

    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
    }

    #profile {
        min-height: 4rem;
    }

    h3 {
        margin: 0;
    }
    p {
        text-align: center;
        line-height: 1.55;
        margin: 0 .75rem .75rem;
    }

    form {

        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1.5rem;

        label {
            position: relative;
            margin-bottom: .75rem;
            width: calc(100% - 8rem);
        }

        input {
            border: 1px white solid;
            margin-top: .25rem;
            margin-bottom: .5rem;
            width: 100%;
        }

        button {
            margin-top: .25rem;
        }
    }

    .centered p {
        margin: 0;
    }

    button.edit {
        margin: .5rem 0 1.5rem 0;
    }

</style>