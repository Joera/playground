<script lang="ts">

    import { fromStore, writable, type Writable } from "svelte/store";
    import { safe_store, addSafe, waitForSafeStoreToBePopulated, waitForSubscriptions, safe_addresses } from '$lib/safe.store';
    import type { SafeService } from "$lib/safe.service";
    import { regenton_abi } from "$lib/regenton_abi";
    import { onMount } from "svelte";
    import { displayAddress } from "$lib/eth.factory";
    import Spinner from "$lib/components/Spinner.svelte";

    const state = writable("");
    const currentStake = writable(0);
    const availableGNO: Writable<Record<string, number>> = writable({});
    let safesWithAvatars: string[] = [];

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
        let balance = 0;
        for (let [safe_address, srv] of Object.entries($safe_store)) {
            
            balance += await getInfo(safe_address, srv);

            srv.subscribe((srv: SafeService) => {
                srv.tokens.subscribe((tokens) => {
                    console.log(tokens)
                    for (let [address, token] of tokens) {
                        console.log(address);
                        console.log(token);
                        if (token.name == "GNO") {
                            if (token && parseFloat(token.balance) > 0) {
                                console.log(safe_address, token.balance)
                                availableGNO.update((available) => {
                                    available[safe_address] = parseFloat(token.balance);
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

    onMount(async () => {

        await waitForSafeStoreToBePopulated($safe_store, $safe_addresses); 
        await waitForSubscriptions($safe_store, safesWithAvatars);
        
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
            state.set("");
        });
    }

</script>



<article>

    <h2>Regenton</h2>

    <div>
        Your current stake is {$currentStake} GNO
    </div>

    {#if $state == "spinner"}
        <Spinner></Spinner>
    {:else}
        <div>
            {#each Object.entries($availableGNO) as [safe_address, balance]}
                <div>{displayAddress("gno", safe_address)}: {balance} GNO</div>
                <button class="button" on:click={() => handleStake(safe_address)}>Stake 1 GNO</button>
            {/each}
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
        margin: 3rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        > button {
            margin: .75rem 0;
        }
    }


</style>