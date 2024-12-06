<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    const handlePassword = (event: Event) => {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        dispatch('password_event', data.get('password'));
    }

</script>

<article>
    

    <form id="password_form" on:submit={handlePassword}>
        <label>Password to encrypt your private key</label>
        <input type="text" name="password" id="password" placeholder="password" />
        <button class="button" type="submit">submit</button>
    </form>
</article>


<style>

    label {
        text-align: center;
        line-height: 1.375;
    }

    article, form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between; 
        width: calc(100% - 2rem);
    }

    input {
        max-width: 260px;
        margin: .75rem 0 1.5rem 0;
    }

</style>