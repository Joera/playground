<script lang="ts">
    import { BarcodeScanner } from 'svelte-barcode-scanner';
    import { writable } from 'svelte/store';

    let previewWidth;
    let mediaErrorMessage = "";

    const newby = writable({});
  
    function onQRScan(event: CustomEvent) {
      
      newby.update((n) => {
        n = event.detail;
        return n
      })
    }
</script>
 
<article>

  <div>{JSON.stringify($newby)}</div>


  {#if Object.keys($newby).length == 0}
  <div class="barcode-scanner">
    <BarcodeScanner />
  </div>
  {/if}

</article>

<style>
	.barcode-scanner {
		width: 100%;
		max-width: 384px;
		aspect-ratio: 1;
	}

  article {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;  
  }
</style>