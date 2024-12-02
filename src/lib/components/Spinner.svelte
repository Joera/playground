<script lang="ts">


</script>

<div class="lds-ripple"><div></div><div></div></div>

<style>


.lds-ripple,
.lds-ripple div {
  box-sizing: border-box;
  margin: auto;
}
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 160px;
  height: 160px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid black;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 76px;
    left: 76px;
    width: 8px;
    height: 8px;
    opacity: 0;
  }
  4.9% {
    top: 76px;
    left: 76px;
    width: 8px;
    height: 8px;
    opacity: 0;
  }
  5% {
    top: 76px;
    left: 76px;
    width: 8px;
    height: 8px;
    opacity: 1;
  }
  100% {
    top: 0;
    left: 0;
    width: 160px;
    height: 160px;
    opacity: 0;
  }
}


</style>