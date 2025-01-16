<script lang="ts">
    import QRCode from "@castlenine/svelte-qrcode";
    import { onMount } from "svelte";
    import { get, writable, type Writable } from "svelte/store";
    import SpinnerWaveHuge from "./SpinnerWaveHuge.svelte";
    import type { Profile } from "@circles-sdk/profiles";
    import { fixSafeAddress } from "$lib/factory/eth.factory";
    import { findSrvByChain, hasGnosisSafeAddress, parseSafeAddress, safe_addresses } from "$lib/store/safe.store";
    import { ipfs_add } from "$lib/factory/ipfs.factory";
    import { profile_state } from "$lib/store/state.store";
    import { profile_store } from '$lib/store/profile.store';
    import { goto } from "$app/navigation";

    export let profile: any;
    export let friend_address: Writable<string>;

    const gnosis_address = writable("");

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
        console.log(cid);
     
        const srv = await findSrvByChain("gnosis");

        if (srv) {

            await get(srv.circles).registerOrUpdateHuman(cid, fixSafeAddress($friend_address));
            friend_address.set("");

            await srv.setDeployed(
                await srv.isDeployed()
            );

            await srv.getSigners();

            profile_store?.set(JSON.stringify(newProfile));
            profile_state.set("")
            goto("/")
        }
    }

    const handleEdit = async () => {
        profile_state.set("edit");
    }

    safe_addresses?.subscribe(async (addresses: string[]) => {
        const g = await hasGnosisSafeAddress()
        if(g) {
            const {chain, address } = parseSafeAddress(g);
            gnosis_address.set(address);
        }
    });

    onMount(() => {

           
    });

</script>

<section class="scrolltainer">

    <article>

        {#if $profile_state == "spinner"} 

            <SpinnerWaveHuge></SpinnerWaveHuge>

        {:else if $profile_state == "edit" || $friend_address != ""}    

            <form id="profile" on:submit={handleProfile}>

                <div id="name_container">
                    <label>
                        What is your name?
                        <input bind:value={$profile.name} type="text" name="name" id="name" placeholder="Name" />
                    </label>
                </div>
                <div id="description_container">
                    <label>
                        What do you do?
                        <textarea bind:value={$profile.description} rows="3" name="description" id="name" placeholder="Description"></textarea> 
                    </label>   
                </div> 
                            <!-- <label>
                                Image
                                <input type="text" name="image" id="name" placeholder="Image" />
                            </label> -->

                <button class="pill white" type="submit">submit</button>
            </form>

        {:else}

            {#if $profile.name != ""}
                <div id="profile"class="centered">
                    <h3>{$profile.name}</h3>
                    <p>{$profile.description}</p>
                </div>

                <button class="pill white edit" on:click={handleEdit} aria-label="edit">edit
                </button>
                
            {/if}

            {#if $gnosis_address != ""}
                <div class="centered">
                    {#if $friend_address == "" && $profile.name == ""}
                        <p>You are not yet trusted by circles to be a human. Ask a (new) friend to scan this and invite you. </p>
                    {/if}
                    <div id="qr">
                        <QRCode data="{$gnosis_address}" backgroundColor="transparent" />
                    </div>
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
        justify-content: center;
        width: calc(100% - 4rem);
        height: 100%;
    }

    #profile {
        min-height: 4rem;
        margin-top: 1.5rem;
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
            width: calc(100%);
        }

        /* input {
            
            margin-top: .25rem;
            margin-bottom: .5rem;
            width: calc(100% - 1.5rem);
        } */

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

    #qr {
        background: white;
        padding: .75rem;
        border-radius: 24px;
    }

    #name_container {
        transform: rotate(-2deg);
        margin: 3rem 0;
    }

    #description_container {
        transform: rotate(2deg);
        margin: 1.5rem 0;
    }

</style>