<script style="ts">
  import SideBar from './Sidebar.svelte';
  import Navbar from './Navbar.svelte';
  import Footer from './Footer.svelte';

  import 'bootstrap/dist/css/bootstrap.min.css';  
  // import scriptSrc from 'bootstrap/dist/js/bootstrap.bundle.js?url';

  
  import 'overlayscrollbars/overlayscrollbars.css';
	import './global.css';
</script>

<svelte:head>
<!-- <script src={scriptSrc}></script> -->
</svelte:head>

<div class="app">
  <SideBar />

  <div class="page">
    <Navbar />

    <slot />

    <Footer />
  </div>
</div>