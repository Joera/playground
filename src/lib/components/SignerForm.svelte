<script lang="ts">
    
    import { createEventDispatcher } from "svelte";    
    import { writable } from "svelte/store";

    const dispatch = createEventDispatcher();
    
    const handleAddress = async (event: any) => {

        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());
        
        dispatch('signer_address_event', formData.address);
    }


</script>




    <form id="profile" on:submit={handleAddress}>

        <label>
            Enter an address that you control from another machine .. 
            <input type="text" name="address" id="address" placeholder="Address">
        </label>

        <button class="button" type="submit">submit</button>
    </form>


<style>

    form {

        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1.5rem;

        label {

            display: block;
            position: relative;
            margin-bottom: 1.5rem;
            width: calc(100% - 2rem);
            line-height: 1.25;
    
        }

        input {
            position: relative;
            border: 1px white solid;
            margin-top: 1.5rem;
            margin-bottom: .5rem;
            width: calc(100% - 2rem);
            min-width: 0;
        }

        button {
            margin-top: .25rem;
        }
    }


</style>

