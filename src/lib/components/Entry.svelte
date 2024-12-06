<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { hasKey } from '$lib/store/key.store';
    import { page } from '$app/stores';

    $: query = $page.url

    onMount( async () => {
     
      if ( query.pathname != "/import" && await(hasKey()) == false) {
          goto('/welcome');
      } 
    });

</script>