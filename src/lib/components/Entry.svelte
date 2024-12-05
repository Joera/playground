<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { hasKey } from '$lib/store/key.store';
    
    onMount( async () => {

      console.log(await hasKey())
      if ( await(hasKey()) == false) {
          goto('/welcome');
      } 
    });

</script>