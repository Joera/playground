
<script lang="ts">
    import { goto } from '$app/navigation';
    import CopyAddress from '$lib/components/CopyAddress.svelte';
    import PasswordForm from '$lib/components/PasswordForm.svelte';
    import SignerForm from '$lib/components/SignerForm.svelte';
    import SpinnerWave from '$lib/components/SpinnerWave.svelte';
    import { addressFromKey } from '$lib/factory/eth.factory';
    import { clearPK, hasKey, signer_key  } from '$lib/store/key.store';
    import { clearSafeStore, findSrvByChain, parseSafeAddress, safe_addresses, safe_store } from '$lib/store/safe.store';
    import { maintenance_state } from '$lib/store/state.store';
    import { onMount } from 'svelte';
    import CryptoJS from 'crypto-js';
    import QRCode from "qrcode";
    import { clearApp, initApp } from '$lib/factory/app.factory';
    import { processImage } from '$lib/factory/qr.factory';
    import { writable, type Writable } from 'svelte/store';
    import CopyAddressAndLink from '$lib/components/CopyAddressAndLink.svelte';
    import type { SafeService } from '$lib/safe.service';

    const encrypted_string: Writable<string> = writable('');

    const active_srv: Writable<SafeService|undefined> = writable(undefined);

    const generateQRCode = async (import_url: string) => {

        try {
            const qrCodeUrl = await QRCode.toDataURL(import_url); // Generate QR code as Data URL

            const { chain, address } = parseSafeAddress($safe_addresses[0]);
            // Automatically download the image
            const link = document.createElement("a");
            link.href = qrCodeUrl;
            link.download = `plg_${address}.png`;
            link.click(); // Trigger download
        } catch (err) {
            console.error("Error generating QR Code:", err);
        }
    };

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
            maintenance_state.set("");
            goto('/')
        }   catch (error) {
            console.error('Error parsing JSON:', error);
            
        }
    }

    const handlePassword = async (event: any) => {

        const object = {
            signer_key: await hasKey(),
            safe_addresses: $safe_addresses
        };

        const jsonString = JSON.stringify(object);
        console.log(jsonString);
        const password = event.detail;
        const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
        const url = `https://app.playground.amsterdam/import?key=${encodeURIComponent(encrypted)}`;

        console.log(url);
        let qrcode = await generateQRCode(url);


    }

    const handleSave = () => {
        maintenance_state.set("passwordForEncryption");
    }

    const handleRemoteSigner = async () => {
        maintenance_state.set("remotesigner")
        // popup
    }

    const handleAddSigner = async (address: string, chain: string) => { 

        maintenance_state.set("spinner");
        await $active_srv?.addSigner(address);
        maintenance_state.set("")
    };

    const handleClear = async () => {
        
        clearApp();
        goto('/welcome');
    }

    const handleWallet = async () => {
        
        maintenance_state.set("wallet")
    }

    const handleChain = async (chain:string) => {
        
        maintenance_state.set("safe")
        const srv = await findSrvByChain(chain);
        if (srv) {
            active_srv.set(srv);
        }
    }


    onMount( async() => {

        maintenance_state.set("wallet")

        setTimeout(() => {
            
            const input = document.getElementById('file_import') as HTMLInputElement;
            input.addEventListener('change', async (event) => {

                const file = (event.target as HTMLInputElement).files?.[0];
                console.log(file);
                if (!file) {
                    return;
                }
            
                const url = await processImage(file);
                const parsedUrl = new URL(url);
                let keyValue = parsedUrl.searchParams.get("key");
                if (keyValue) {
                    encrypted_string.set(keyValue);
                    maintenance_state.set("passwordForDecryption");
                }
            });

        }, 500)
        
        
    })

</script>

<h2>Settings</h2>

<section class="scrolltainer">

    <article>

        {#if $maintenance_state == "spinner"}

            <SpinnerWave></SpinnerWave>
        
        {:else if $maintenance_state == "passwordForDecryption"}

            <PasswordForm on:password_event={handleDecrypt}></PasswordForm>

        {:else if $maintenance_state == "passwordForEncryption"}

            <PasswordForm on:password_event={handlePassword}></PasswordForm>

        {:else if $maintenance_state == "remotesigner"}

            <SignerForm on:signer_address_event={(event) => handleAddSigner(event.detail,"gnosis")}></SignerForm>

        {:else if $maintenance_state == "wallet"}

            <div>
                <h3>Signer</h3>
                {#if $signer_key}
                    <CopyAddress address={addressFromKey($signer_key)}></CopyAddress>
                {/if}
            </div>

            <div>
                <button class="button" on:click={() => handleSave()}>Backup to device</button>
            </div>

            <div>
                <button class="button" on:click={() => handleClear()}>Clear localstorage</button>
            </div>

            <div>
                <h3>Restore from backup</h3>
                <input class="button" id="file_import" type="file" accept=".png">
            </div>

            

        {:else if $maintenance_state == "safe" && $active_srv != undefined}


            

            <div>
                <h3>Safe on {$active_srv.chain}</h3>
                <CopyAddressAndLink address={$active_srv.safe_address} chain={$active_srv.chain}></CopyAddressAndLink>
            </div>

            <div>
                <h3>Remote signer</h3>
                <button class="button"on:click={handleRemoteSigner}>add</button>
            </div>

        {/if}

    </article>

</section>

<nav>
    <button class="button" on:click="{handleWallet}">wallet</button>
    <button class="button" on:click="{() => handleChain('base')}">base</button>
    <button class="button" on:click="{() => handleChain('gnosis')}">gnosis</button>
</nav>


<style>

    article {

        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        button, input {
            margin: .5rem 0 0 0;
        }

        #file_import {
            width: 260px;
        }
    }

</style>