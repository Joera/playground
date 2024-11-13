<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    export let data;
  
    onMount( async () => {
      if (!data.keyExists) {
          goto('/welcome');
      } 
    });

</script>