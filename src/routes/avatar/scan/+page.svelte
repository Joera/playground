<script lang="ts">
    // import { BarcodeScanner } from 'svelte-barcode-scanner';
    import { BrowserMultiFormatReader } from '@zxing/library';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let videoElement: any;
    let logMessage = '';
    const newby = writable({});

    let codeReader = new BrowserMultiFormatReader();

    onMount(() => {
      // Start the camera when the component mounts
      codeReader
        .decodeFromInputVideoDevice(undefined, videoElement)
        .then((result) => {
          logMessage = `QR Code detected: ${result.getText()}`;
          alert(logMessage);
          newby.update((n) => {
            n = result.getText()
            return n
          })
        })
        .catch((err: any) => {
          alert('Error occurred while scanning QR code' + err);
        });

      return () => {
        // Clean up the camera when the component unmounts
        codeReader.reset();
      };
    });

    const startScanner = async () => {
      try {
        const videoDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId = videoDevices[0].deviceId; 
        await codeReader.decodeFromVideoDevice(selectedDeviceId, videoElement, () => {});
      } catch (error) {
        console.error('Error accessing video device:', error);
      }
    };

    function onQRScan(event: CustomEvent) {

      alert(JSON.stringify(event));
      
      newby.update((n) => {
        n = event.detail;
        return n
      })
    }
</script>
 
<article>

  <div>{JSON.stringify($newby)}</div>

  {#if Object.keys($newby).length == 0}
    <video bind:this={videoElement} autoplay></video>
  {/if}

</article>

<style>
	.barcode-scanner {
		width: 100%;
		max-width: 384px;
		aspect-ratio: 1;
	}

  video {
    width: 100%;
    max-width: 600px;
  }

  article {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;  
  }
</style>