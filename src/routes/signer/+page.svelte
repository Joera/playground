<script lang="ts">

    import { displayAddress } from '$lib/factory/eth.factory.js';
    import { Wallet } from 'ethers';
    import { signer_key } from '$lib/store/key.store.js';
    

    // export let data;
    // const { keyExists } = data; 
    // console.log(1);
    // let signer_address = "";
    // if (typeof keyExists == "string") {
    //     console.log(2);
    //     const w = new Wallet(keyExists);
    //     signer_address = w.address;
    //     console.log(3);
    // } 

    function addressFromKey(privateKey: string) {
        const wallet = new Wallet(privateKey);
        return wallet.address;
    }

     $: key =  signer_key;


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

        <label>local signer</label>

        <div class="signer">
           
            <div class="option">
                <!-- <label>local</label> -->
                <div class="address">
                    {displayAddress("gno",addressFromKey($key))}
                </div>
            </div>

            <!-- <div class="option">
                <button>add remote</button>
            </div> -->

        </div>

   


       


</article>

