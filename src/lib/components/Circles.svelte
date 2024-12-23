<script lang="ts">
    import { CirclesV1 } from "$lib/datavis/circles-ctrlr";
    import { uint256ToAddress } from "@circles-sdk/utils";
    import { ethers } from "ethers";
    import { onMount } from "svelte";

    export let circles;
    export let srv;

     


onMount(async () => {

    circles.subscribe( async(circles: any) => {
        
        // let data: any[] = Array.from(circles.values());
 
        console.log(circles);
 
         if(circles.length > 0) {
 
             for (let token of circles) {
 
                 const name = await $srv.getAvatarName(uint256ToAddress(BigInt(token.address)));
                 token.profileName = name;
                 token.profileSymbol = (name == undefined) 
                     ? "" 
                     : (ethers.getAddress(uint256ToAddress(BigInt(token.address))) == $srv.safe_address)
                         ? "myCRC"
                         : name.split(' ')[0].slice(0,4);
             }
 
             circles = circles.filter ((d: any) => d.profileName != undefined);
 
             const vis = new CirclesV1("d3-circles")
             vis.html();
             vis.init(circles);
         }
     }) 
    
})
     
</script>


<section id="d3-circles"></section>


<style>
     
     #d3-circles {

        margin-top: 1.5rem;
        width: 100%;
        min-height: 300px;
    }

</style>