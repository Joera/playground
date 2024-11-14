<script lang="ts">
    import { avatar_store } from '$lib/avatar.store';
    import { displayAddress } from '$lib/eth.factory';

    // import { BarcodeScanner } from 'svelte-barcode-scanner';
    import { BrowserMultiFormatReader } from '@zxing/library';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let videoElement: any;
    let logMessage = '';
    const newby_address = writable("");

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

      const avatar = await $avatar_store.inviteHuman($newby_address);
      alert(avatar);
    }

</script>
 
<article>

  {#if $newby_address == ""}
    <video bind:this={videoElement} autoplay></video>
  {:else}
    <div>
      <h2>Will you invite ... </h2>
      { displayAddress("gno", $newby_address)}</div>
      <button on:click={inviteHandler}>yes!</button>
  {/if}

</article>

<style>

  video {
    width: 100%;
    max-width: 600px;
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