<!-- <script lang="ts">
    
    import { avatar_store } from "$lib/avatar.store";
    import {cidV0ToUint8Array, staticCirclesToAttoCircles} from '@circles-sdk/utils';
    import { safe_store } from "$lib/safe.store";
    import type { Profile } from "@circles-sdk/profiles";
    import { goto } from "$app/navigation";
    import Spinner from "./Spinner.svelte";
    import { writable } from "svelte/store";
    import { uploadFile } from "$lib/pinata.factory";
    import { fixSafeAddress } from "$lib/eth.factory";

    export let profile: any;
    export let friend_address: string;

    const spinner = writable(false);

   

</script>


{#if $spinner} 
    <Spinner></Spinner>
{:else}

    <form id="profile" on:submit={handleProfile}>

        <label>
            What is your name?
            <input type="text" name="name" id="name" placeholder="Name">
        </label>
        <label>
            What do you do?
            <input type="text" name="description" id="name" placeholder="Description">
        </label>
        <label>
            Image
            <input type="text" name="image" id="name" placeholder="Image">
        </label>

        <button class="button" type="submit">submit</button>
    </form>
{/if}

<style>

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
 -->
