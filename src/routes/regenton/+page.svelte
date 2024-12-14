<script lang="ts">

    import { fromStore, writable, type Writable } from "svelte/store";
    import { safe_store, addSafe, waitForSafeStoreToBePopulated, safe_addresses, hasGnosisSafeAddress, parseSafeAddress } from '$lib/store/safe.store';
    import type { SafeService } from "$lib/safe.service";
    import { regenton_abi } from "$lib/regenton_abi";
    import { onMount } from "svelte";
    import { displayAddress } from "$lib/factory/eth.factory";
    import Spinner from "$lib/components/Spinner.svelte";
    import { validators_api } from "$lib/apis";
    import SpinnerWave from "$lib/components/SpinnerWave.svelte";

    const state = writable("");
    const regenton: any = writable({});
    const currentStake = writable(0);
    const availableGNO: Writable<Record<string, number>> = writable({});
    // let safesWithAvatars: string[] = [];

    const regentonContract = "0x05456E26dF26ef77f6A2DA6f14E8cCbd96b10c3E";

    const getStake = async (safe_address: string, srv: SafeService) => {
        return await srv.genericCall(regentonContract, regenton_abi, "balanceOf", [safe_address]);
    }

    async function getInfo(safe_address: string, srv: Writable<SafeService>) : Promise<number> {

        return new Promise(async (resolve) => {
            
            srv.subscribe( async (srv: SafeService) => {
                if (await fromStore(srv.deployed)) {
                    const r = await getStake(safe_address, srv);
                    resolve(parseFloat(r))
                }
            })
        })
    }

    async function init() {

        regenton.set(
            await fetchMetrics()
        );


        let balance = 0;
        let gnosis_address = await hasGnosisSafeAddress();
        // for (let [safe_address, srv] of Object.entries($safe_store)) {

        if (gnosis_address) {
            
            const srv = $safe_store[gnosis_address];

            const { chain, address } = parseSafeAddress(gnosis_address);
                
            balance += await getInfo(address, srv);

            srv.subscribe((srv: SafeService) => {
                srv.tokens.subscribe((tokens) => {
                    // console.log(tokens)
                    for (let [address, token] of tokens) {
                
                        if (token.name == "GNO") {
                            if (token && parseFloat(token.balance) > 0) {
                            
                                availableGNO.update((available) => {
                                    available[address] = parseFloat(token.balance);
                                    return available;
                                });
                            }
                        }
                    }
                    
                })
            }) 
        }  
     
        currentStake.set(balance);
    }

    const fetchMetrics = async () => {
    
        const regenton_response = await validators_api.get('/metrics', {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (regenton_response.status !== 200) {

            console.log(regenton_response);
           // throw new Error(`Error calling regenton metrics: ${regenton_response.statusText}`);
        }

        return regenton_response.data;
    }

    onMount(async () => {

        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses); 
        // await waitForSubscriptions($safe_store, safesWithAvatars);
        init();
    })


    const handleStake = async (safe_address: string) => {
        
        const TOKENADDRESS = '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb';
        const tokenAbi = ["function approve(address spender, uint256 amount) public returns (bool)"];

        const srv = $safe_store["gnosis"];

        srv.subscribe( async (srv: SafeService) => {
            state.set("spinner");
            await srv.genericTx(TOKENADDRESS, regenton_abi, "approve", [safe_address,1], false);
            await srv.genericTx(regentonContract, regenton_abi, "mintPlgGNO", [], false);
            init();
            state.set("");
        });
    }

</script>



<article>

    <h2>Regenton</h2>

    <div>
        <!-- <h3>Community:</h3> -->
        <label>TVL</label>
        <div class="number">{@html $regenton.tvl}</div>
        <label>Rewards</label>
        <div class="number">{@html $regenton.rewards}</div>

    </div>

   

    {#if $state == "spinner"}
        <SpinnerWave></SpinnerWave>
    {:else}
        <div class="centered">  
            <span>Your current stake is {$currentStake} GNO</span>
            <span>Available to stake: {$availableGNO[$safe_addresses[0]]}GNO</span>
            <!-- {#each Object.entries($availableGNO) as [safe_address, balance]}
                <div>{balance} GNO</div> -->
            <button class="button" on:click={() => handleStake($safe_addresses[0])}>Stake 1 GNO</button>
            <!-- {/each} -->
        </div>
    {/if}


    

</article>


<style>

    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    article > div {
        margin: 1.5rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        > button {
            margin: .75rem 0;
        }
    }

    .number {
        font-size: 3rem;
        font-weight: 700;
        font-family: 'Gotham A', 'GOTHAM B';
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
    }


</style>