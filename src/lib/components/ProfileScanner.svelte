<script lang="ts">
 
    import { displayAddress, expiryTimeHex } from '$lib/eth.factory';

    import { BrowserMultiFormatReader } from '@zxing/library';
    import { createEventDispatcher, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Spinner from './Spinner.svelte';
    import { goto } from '$app/navigation';
    import { circles_addresses, safe_store } from '$lib/safe.store';
    import { hubv2_abi } from '$lib/circles_hub_v2';
    import { cidV0ToUint8Array } from '@circles-sdk/utils';
    import { GnosisChainConfig } from '$lib/circles.factory';

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

      // avatar_store.subscribe(async (store) => {

        const hubv2Address = GnosisChainConfig.v2HubAddress != undefined ? GnosisChainConfig.v2HubAddress : "";
        

        circles_addresses.subscribe( (addresses) => {
            safe_store.subscribe(async (store) => {

                const safeService = (await store)[addresses[0]];
                
                safeService.subscribe(async (srv) => {
                    spinner.set(true);
                    const r = await srv.genericTx(hubv2Address, hubv2_abi, "trust", [$newby_address, expiryTimeHex()], false);
                    console.log(r);  
                    dispatch('invite_success_event');
                    spinner.set(false);
                })
            })
        });
     
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
        <h3>Do you trust ... </h3>
        { displayAddress("gno", $newby_address)}</div>

        <!--check crc balance - shoud be > 96 --> 
        <button on:click={inviteHandler}>yes!</button>
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
  }

  button {
    margin-top: 3rem;
  }
</style>