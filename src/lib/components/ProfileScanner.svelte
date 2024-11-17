<script lang="ts">
    import { avatar_store } from '$lib/avatar.store';
    import { displayAddress } from '$lib/eth.factory';

    import { BrowserMultiFormatReader } from '@zxing/library';
    import { createEventDispatcher, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Spinner from './Spinner.svelte';
    import { goto } from '$app/navigation';

    let videoElement: any;
    let logMessage = '';
    const newby_address = writable("");
    const spinner = writable(false);
    const dispatch = createEventDispatcher();

    let codeReader = new BrowserMultiFormatReader();

    onMount(() => {
      codeReader
        .decodeFromInputVideoDevice(undefined, videoElement)
        .then((result) => {
          newby_address.update((n) => {
            n = result.getText()
            return n
          })
        })
        .catch((err: any) => {
          alert('Error occurred while scanning QR code' + err);
        });

      return () => {
        codeReader.reset();
      };
    });

    const inviteHandler = async () => {

      const sdk = Object.values(await avatar_store)[0];
      spinner.set(true);
      const avatar = await sdk.inviteHuman($newby_address);
      dispatch('invite_success_event');
      spinner.set(false);

      
    }

</script>
 
<article>


  {#if $spinner}

    <Spinner></Spinner>

  {:else}

    {#if $newby_address == ""}
      <video bind:this={videoElement} autoplay></video>
    {:else}
      <div>
        <h3>Will you invite ... </h3>
        { displayAddress("gno", $newby_address)}</div>
        <button on:click={inviteHandler}>yes!</button>
    {/if}

  {/if}

</article>

<style>

  video {
    width: 100%;
    max-width: 600px;
    max-height: 100vw;
  }

  article, article div {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;  
  }

  button {
    margin-top: 3rem;
  }
</style>