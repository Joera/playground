<script lang="ts">
    import PasswordForm from "$lib/components/PasswordForm.svelte";
    import { page } from '$app/stores';

    // Automatically updates if the URL changes
    $: query = $page.url.searchParams.get('key');

    console.log(query)

    const handlePassword = async (event: any) => {

        if (query) {
            
            const password = event.detail;
            const bytes = CryptoJS.AES.decrypt(query, password);
            const decryptedJsonString = bytes.toString(CryptoJS.enc.Utf8);

            // Convert the decrypted string back to a JSON object
            const decryptedObject = JSON.parse(decryptedJsonString);
            console.log("Decrypted JSON:", decryptedObject);
        }

        
    }

</script>

<section>

    <h2>import</h2>

    <PasswordForm on:password_event={handlePassword}></PasswordForm>


</section>