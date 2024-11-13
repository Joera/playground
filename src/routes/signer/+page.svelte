<script lang="ts">

    import { displayAddress } from '$lib/eth.factory.js';
    import { Wallet } from 'ethers';
    

    export let data;
    const { keyExists } = data; 

    let signer_address = "";
    if (typeof keyExists == "string") {
        const w = new Wallet(keyExists);
        signer_address = w.address;
    } 


</script>

<style>

    article {
        position: relative;
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        min-height: 320px;
        
        > div {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
        }
    }


    .option {

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: .75rem;
        /* border: 1px solid black */
        
    }

</style>


<article>

        <label>signers</label>

        <div class="signer">
           
            <div class="option">
                <label>local</label>
                <div class="address">
                    {signer_address}
                </div>
            </div>

            <div class="option">
                <button>add remote</button>
            </div>

        </div>

   


       


</article>

