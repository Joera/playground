<script lang="ts">

    import QRCode from "@castlenine/svelte-qrcode";

    export let profile: any;
    export let owner_address: string;

    const isTrusted = false;

</script>




{#if profile}

    <div class="centered">
        <label>Name</label>
        <div>{profile.name }</div>

        <label>description</label>
        <div>{profile.desription }</div>
    </div>

{/if}

{#if owner_address != ""}
    <div class="centered">
        {#if !isTrusted}
            <p>You are not yet trusted by circles to be a human. Ask a (new) friend to scan this and invite you. </p>
        {/if}
        <QRCode data="{owner_address}" backgroundColor="transparent" />
    </div>
{/if}

<style>
    p {
        text-align: center;
        line-height: 1.55;
        margin: 0 .75rem .75rem;
    }
</style>