<script lang="ts">
    import { displayShortAddress, displayShorterAddress } from '$lib/factory/eth.factory';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let address: string;

  const copied = writable(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(address).then(() => {
      copied.set(true);
      setTimeout(() => copied.set(false), 2000); // Reset copied state after 2 seconds
    });
  }
</script>

<div class="address-container">
  <span class="address">{displayShortAddress(address)}</span>
  <button class="copy-button" on:click={copyToClipboard}>
    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 50 62.5" x="0px" y="0px"><path d="M36.71,9.57H21.15a3.85,3.85,0,0,0-3.85,3.85v3.75h-4A3.85,3.85,0,0,0,9.44,21V36.58a3.86,3.86,0,0,0,3.85,3.85H28.85a3.85,3.85,0,0,0,3.85-3.85V32.83h4A3.85,3.85,0,0,0,40.56,29V13.42A3.86,3.86,0,0,0,36.71,9.57Zm-7.09,27a.77.77,0,0,1-.77.77H13.29a.78.78,0,0,1-.77-.77V21a.77.77,0,0,1,.77-.77H28.85a.76.76,0,0,1,.77.77V36.58ZM37.48,29a.77.77,0,0,1-.77.77h-4V21a3.85,3.85,0,0,0-3.85-3.85H20.38V13.42a.77.77,0,0,1,.77-.77H36.71a.78.78,0,0,1,.77.77Z"/></svg>
  </button>
  {#if $copied}
    <span class="copied-notification">Copied!</span>
  {/if}
</div>

<style>
  .address-container {
    display: flex;
    align-items: center;
  }

  .address {
    min-width: 0;
  }

  .copy-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;

        svg {
            width: 2.8rem;
            height: 2.8rem;
            margin-top: 1rem;
        }
  }
  .copied-notification {
    margin-left: 10px;
    color: green;
    font-size: 0.9em;
  }
</style>
