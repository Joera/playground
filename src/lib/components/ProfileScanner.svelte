<script lang="ts">
 
    import { displayAddress, expiryTimeHex } from '$lib/factory/eth.factory';

    import { BrowserMultiFormatReader } from '@zxing/library';
    import { createEventDispatcher, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { findSrvByChain, safe_store } from '$lib/store/safe.store';
    import { hubv2_abi } from '$lib/circles_hub_v2';
    import SpinnerWave  from './SpinnerWave.svelte';
    import { HUBV2ADDRESS } from '$lib/constants';
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

        const srv = await findSrvByChain("gnosis");
        if (srv) {
          spinner.set(true);
          const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "trust", [$newby_address, expiryTimeHex()], false);
          // dispatch('invite_success_event');
          goto("/profile");
          spinner.set(false);
        }
    }

</script>
 
<article>


  {#if $spinner}

    <SpinnerWave></SpinnerWave>

  {:else}

    {#if $newby_address == ""}
      <video bind:this={videoElement} autoplay></video>
    {:else}
      <div>
        <h3>do you trust?</h3>
        { displayAddress("gno", $newby_address)}</div>
        <!--check crc balance - shoud be > 96 --> 
        <button class="button" on:click={inviteHandler}>yes!</button>
    {/if}

  {/if}

</article>

<style>

  video {
    width: 100%;
    max-width: 600px;
    max-height: calc(100vw - 4rem);
  }

  article, article div {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;  
    min-height: calc(100% - 4rem);
   
  }

  button {
    margin-top: 3rem;
  }
</style>