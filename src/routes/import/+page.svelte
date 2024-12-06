<script lang="ts">
    import PasswordForm from "$lib/components/PasswordForm.svelte";
    import { page } from '$app/stores';
    import CryptoJS from 'crypto-js';
    import { onMount } from "svelte";

    // Automatically updates if the URL changes
    $: query = $page.url?.searchParams?.get('key');

   

    const handlePassword = async (event: any) => {

        if (query) {

            const password = event.detail;
            const bytes = CryptoJS.AES.decrypt(query, password);
            const decryptedJsonString = bytes.toString(CryptoJS.enc.Utf8);
            console.log(decryptedJsonString)
            // Convert the decrypted string back to a JSON object
            let decryptedObject;
            try {
                decryptedObject = JSON.parse(decryptedJsonString);
            }   catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            
            console.log("Decrypted JSON:", decryptedObject);
        }
    }

    onMount( async () => { 

        console.log($page.url.searchParams);     
        console.log(query)

    });

</script>

<h2>import</h2>
<section>
    <PasswordForm on:password_event={handlePassword}></PasswordForm>
</section>

<style>

    section {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: calc(100% - 2rem);
    }

    button, input {
            margin: .5rem 0 0 0;
        }

    input {
        width: 260px;
    }

</style>