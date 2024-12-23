<script lang="ts">
 
    import { displayAddress, expiryTimeHex } from '$lib/factory/eth.factory';

    import { BrowserMultiFormatReader } from '@zxing/library';
    import { createEventDispatcher, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { findSrvByChain } from '$lib/store/safe.store';
    import { hubv2_abi } from '$lib/circles_hub_v2';
    import SpinnerWaveHuge  from '$lib/components/SpinnerWaveHuge.svelte';
    import { HUBV2ADDRESS } from '$lib/constants';
    import { goto } from '$app/navigation';
    import { avatar_state } from '$lib/store/state.store';

    let videoElement: any;
    let logMessage = '';
    const newby_address = writable("");
    const scanner_state = writable("");
    const tx = writable({});

    let codeReader = new BrowserMultiFormatReader();

    onMount(() => {
      codeReader
        .decodeFromInputVideoDevice(undefined, videoElement)
        .then((result) => {

          console.log(result.getText())

          if (result.getText().startsWith("0x")) {
            scanner_state.set("invite");
            newby_address.update((n) => {
              n = result.getText()
              return n
            })
          } else {

            // ethereum:0xb794f5ea0ba39494ce839613fffba74279579268?amount=1.123
            scanner_state.set("pay");
          }
        })
        .catch((err: any) => {
          alert('Error occurred while scanning QR code' + err);
        });

      return () => {
        codeReader.reset();
      };
    });

    const handlePay = (event: any) => {
        
        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());
    }

    const inviteHandler = async () => {

        const srv = await findSrvByChain("gnosis");

        if (srv) {
          scanner_state.set("spinner");
          const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "trust", [$newby_address, expiryTimeHex()], false);
          console.log(r);  
          scanner_state.set("");
          avatar_state.set("contacts");
          goto("/avatar");
        }
    }

</script>
 
<article>


    {#if $scanner_state ==  "spinner"}

      <SpinnerWaveHuge></SpinnerWaveHuge>

    {:else if $scanner_state == "invite"}
 
      <div>
        <h3>do you trust?</h3>
        { displayAddress("gno", $newby_address)}</div>

        <!--check crc balance - shoud be > 96 --> 
        <button class="button" on:click={inviteHandler}>yes!</button>

    {:else if $scanner_state == "pay"} 

      Tip + times X 
    
      <form id="profile" on:submit={handlePay}>

          <!-- <div id="name_container">
              <label>
                  Amount?
              <input bind:value={$tx.amount} type="text" name="name" id="name" placeholder="Name" />
              </label>
          </div>
          <div id="description_container">
              <label> 
                To?
                <input bind:value={$tx.to} type="text" name="name" id="name" placeholder="Name" />
              </label>   
          </div>  -->
                      <!-- <label>
                          Image
                          <input type="text" name="image" id="name" placeholder="Image" />
                      </label> -->

          <button class="pill white" type="submit">submit</button>
      </form>}

    {:else} 
        
        <video bind:this={videoElement} autoplay></video>

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