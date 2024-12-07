<script lang="ts">
    import { goto } from "$app/navigation";
    import { initPK, signer_key } from "$lib/store/key.store";
    import { addSafe, safe_addresses } from "$lib/store/safe.store";
    import { onMount } from "svelte";

    import { welcome_state } from "$lib/store/state.store";
    import { clearApp, initApp } from "$lib/factory/app.factory";
    import SpinnerWave from "$lib/components/SpinnerWave.svelte";
    import { processImage } from "$lib/factory/qr.factory";
    import CryptoJS from 'crypto-js';
    import { type Writable, writable } from "svelte/store";
    import PasswordForm from "$lib/components/PasswordForm.svelte";

    // Function to handle button clicks
    const default_setup = async () => {
        await initPK();
        await initApp();
        // await addSafe("gnosis");
        // await addSafe("base");
        goto('/avatar');
    };

    const encrypted_string: Writable<string> = writable('')

    const handleDecrypt = async (event: any) => {

        const password = event.detail;
        const bytes = CryptoJS.AES.decrypt($encrypted_string, password);
        const decryptedJsonString = bytes.toString(CryptoJS.enc.Utf8);
        console.log(decryptedJsonString)
        // Convert the decrypted string back to a JSON object
        let decryptedObject;
        try {
            decryptedObject = JSON.parse(decryptedJsonString);
            console.log(decryptedObject);
            clearApp();
            signer_key?.set(decryptedObject.signer_key);
            safe_addresses?.set(decryptedObject.safe_addresses);
            await initApp();
            goto('/')
        }   catch (error) {
            console.error('Error parsing JSON:', error);
            
        }
    }

    onMount(async () => {

        const input = document.getElementById('file_import') as HTMLInputElement;
        input.addEventListener('change', async (event) => {
            
            const file = (event.target as HTMLInputElement).files?.[0];
            console.log(file);
            if (!file) {
                return;
            }
        
            const url = await processImage(file);
            const parsedUrl = new URL(url);
            // Get the 'key' parameter value
            let keyValue = parsedUrl.searchParams.get("key");
            console.log("Extracted key:", keyValue);
            if (keyValue) {
                encrypted_string.set(keyValue);
                welcome_state.set("password");
            }
        });
    });
    
</script>

<style global lang="scss">
    article {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        min-height: 240px;
        max-width: calc(100% - 4rem);

        label {
            text-align: center;
            line-height: 1.55;
            margin: 0 .75rem .75rem;
        }
    }

    h2 {
        margin-bottom: 3rem;
    }

    .centered {
        margin-top: 3rem;
    }

    input#file_import {
        max-width: 230px;
    }
</style>

<h2>Welcome!</h2>

<article>

    {#if $welcome_state == "spinner"}

        <SpinnerWave></SpinnerWave>

    {:else if $welcome_state == "password"}

        <PasswordForm on:password_event={handleDecrypt}></PasswordForm>

    {:else}

        <label>Click the button to create a private key, deploy a safe on the Gnosis chain and register a circles avatar with the safe address.</label>
        <button class="button" on:click={default_setup}>Do it!</button>
        <!-- <label>advanced: (requires configuring)</label>
        <button class="button" on:click={advanced_setup}>Existing Safe & Circles avatar</button> -->
        <div class="centered">
            <label>.. or restore from backup</label>
            <input class="button" id="file_import" type="file" accept=".png">
        </div>
    {/if}
</article>

