<script lang="ts">
    import { BarcodeScanner } from 'svelte-barcode-scanner';

    let previewWidth;
    let mediaErrorMessage = "";
  
    function onQRScan(event: CustomEvent) {
      alert(event.detail.qrContent);
    }
</script>
 
<div class="barcode-scanner">
	<BarcodeScanner />
</div>

<style>
	.barcode-scanner {
		width: 100%;
		max-width: 384px;
		aspect-ratio: 1;
	}
</style>