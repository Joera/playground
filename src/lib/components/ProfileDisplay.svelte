<script lang="ts">
    // import { avatar_address, avatar_store } from "$lib/avatar.store";
    import QRCode from "@castlenine/svelte-qrcode";
    import { onMount } from "svelte";
    import { on } from "svelte/events";
    import { writable, type Writable } from "svelte/store";
    import Spinner from "./Spinner.svelte";
    import type { Profile } from "@circles-sdk/profiles";
    import { fixSafeAddress } from "$lib/eth.factory";
    import { circles_addresses, safe_store } from "$lib/safe.store";
    import { cidV0ToUint8Array } from "@circles-sdk/utils";
    import { ipfs_add } from "$lib/ipfs.factory";

    export let profile: any;
    export let friend_address: Writable<string>;
    export let owner_address: Writable<string>;

    const state = writable("");


    const handleProfile = async (event: any) => {

        state.set('spinner');

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
        console.log(cid);
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

                const safeService = (await store)[addresses[0]];
            
                safeService.subscribe(async (srv) => {

                    const _metadataDigest:  Uint8Array = cidV0ToUint8Array(cid);
                    console.log("friend", $friend_address)

                    if($friend_address != "" && friend_address != undefined) {
                        console.log("registering");
                        const r = await srv.genericTx(hubv2Address, abi_hub, "registerHuman", [fixSafeAddress($friend_address), _metadataDigest], false);
                        console.log(r);
                    } else {
                        console.log("updating profile");
                        const r = await srv.genericTx(nameRegistryAddress, abi_nameregistry, "updateMetadataDigest", [_metadataDigest], false);
                        console.log(r);
                    }

                    // const sdk = Object.values(await _astore)[0]
                    // let r = "";

                    // try {
                    //     r = await sdk.updateProfile(newProfile);
                    // } catch (error) {}
                    
                    // console.log(r);
                    state.set("")
                })
            })
        });
    }

    const handleEdit = async () => {
        state.set("edit");
    }

    profile.subscribe((p: any) => {
        if (profile.name == "") {
            state.set("edit");
        }
    });

    onMount(() => {


    });

</script>

{#if $state == "spinner"} 

    <Spinner></Spinner>

{:else if $state == "edit"}

    <form id="profile" on:submit={handleProfile}>

        <label>
            What is your name?
            <input bind:value={$profile.name} type="text" name="name" id="name" placeholder="Name" />
        </label>
        <label>
            What do you do?
            <textarea bind:value={$profile.description} rows="3" name="description" id="name" placeholder="Description" />
        </label>    
                    <!-- <label>
                        Image
                        <input type="text" name="image" id="name" placeholder="Image" />
                    </label> -->

        <button class="button" type="submit">submit</button>
    </form>

{:else}

    {#if $profile.name != ""}
        <div class="centered">
            <h3>{$profile.name }</h3>
            <p>{$profile.description }</p>
        </div>

        {#if $friend_address != ""}
            <button class="icon" on:click={handleEdit}>
                <svg xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 125" style="enable-background:new 0 0 100 100;" xml:space="preserve"><switch><foreignObject requiredExtensions="http://ns.adobe.com/AdobeIllustrator/10.0/" x="0" y="0" width="1" height="1"/><g i:extraneous="self"><path d="M82.1,14.9c-0.4-1.5-1.3-2.7-2.5-3.4L66,3.3c-2.6-1.5-6.1-0.7-7.7,1.9L19.9,68.8c-0.1,0.3-0.2,0.5-0.3,0.8l-1.9,25.8    c-0.1,0.7,0.3,1.4,0.9,1.7c0.4,0.3,0.9,0.3,1.4,0.2c0.2,0,0.4-0.1,0.5-0.2l21.9-13.8c0.2-0.2,0.5-0.4,0.6-0.6l38.4-63.7    C82.3,17.9,82.5,16.4,82.1,14.9z M54,19.5l3.5,2.1L27.6,71.1L24.1,69L54,19.5z M60.7,23.5l3.5,2.1L34.3,75.2l-3.5-2.1L60.7,23.5z     M26.5,89.1l-4.3-2.6l1-13.7l14.9,9L26.5,89.1z M40.9,79.2l-3.5-2.1l29.8-49.5l3.5,2.1L40.9,79.2z M72.7,26.5L55.9,16.3l2.3-3.8    L75,22.6L72.7,26.5z M78.3,17.2l-1.3,2.2L60.1,9.3l1.3-2.2C62,6.2,63.2,5.9,64,6.5l13.6,8.2C78.5,15.2,78.8,16.3,78.3,17.2z"/></g></switch></svg>
            </button>
        {/if}
    {/if}

    {#if $owner_address != ""}
        <div class="centered">
            {#if $friend_address == "" && $profile.name == ""}
                <p>You are not yet trusted by circles to be a human. Ask a (new) friend to scan this and invite you. </p>
            {/if}
            <QRCode data="{$owner_address}" backgroundColor="transparent" />
        </div>
    {/if}

{/if}

<style>
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
</style>