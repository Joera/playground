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
 
        let circlesArray: any[] = Array.from(circles.values());
        if(circlesArray.length > 0) {
 
             for (let token of circlesArray) {

                //console.log(token);
 
                 const name = await $srv.getAvatarName(token.issuerAddress);
                 token.profileName = name;
                 token.profileSymbol = (name == undefined) 
                     ? "" 
                     : (ethers.getAddress(token.issuerAddress) == $srv.safe_address)
                         ? "myCRC"
                         : name.split(' ')[0].slice(0,4);
             }
 
             circlesArray = circlesArray.filter ((d: any) => d.balance > 0);
 
             const vis = new CirclesV1("d3-circles")
             vis.html();
             console.log(circlesArray); 
             vis.init(circlesArray);
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