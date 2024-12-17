<script lang="ts">

    import { fromStore, writable, type Writable } from "svelte/store";
    import { safe_store, addSafe, waitForSafeStoreToBePopulated, safe_addresses, hasGnosisSafeAddress, parseSafeAddress, findAddressByChain, findSrvByChain } from '$lib/store/safe.store';
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
    const TOKENADDRESS = '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb';
    // let safesWithAvatars: string[] = [];

    $: gnosis_address = "";


    const regentonContract = "0x05456E26dF26ef77f6A2DA6f14E8cCbd96b10c3E";

    const getStake = async (safe_address: string, srv: SafeService) => {
        return await srv.genericCall(regentonContract, regenton_abi, "balanceOf", [safe_address]);
    }

    async function getInfo(safe_address: string, srv: SafeService) : Promise<number> {

        return new Promise(async (resolve) => {
           
                // if (await srv.getDeployed())) {
                    const r = await getStake(safe_address, srv);
                    resolve(parseFloat(r))
                // }
            
        })
    }

    async function init() {

        const prefixed_address =(await findAddressByChain("gnosis"));
        if(prefixed_address) {
            const { chain, address}  = parseSafeAddress(prefixed_address);
            gnosis_address = prefixed_address;
        }

        regenton.set(
            await fetchMetrics()
        );


        let balance = 0;
    
        const srv = await findSrvByChain("gnosis");

        if (srv) {
            
            balance += await getInfo(srv.safe_address, srv);

         
                srv.tokens.subscribe((tokens) => {
                   
                    for (let [address, token] of tokens)  {
                                    
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


    const handleStake = async () => {

        const a = await findAddressByChain("gnosis");
        if (!a) return;
        const { chain, address } = parseSafeAddress(a);
        
        const tokenAbi = ["function approve(address spender, uint256 amount) public returns (bool)"];

        const srv = await findSrvByChain("gnosis");

        if(srv) {
            state.set("spinner");
            await srv.genericTx(TOKENADDRESS, tokenAbi, "approve", [regentonContract,1], false);
            await srv.genericTx(regentonContract, regenton_abi, "mintPlgGNO", [], false);
            init();
            state.set("");
        }
    }

</script> 





    <h2>Regenton</h2>

    <section class="scrolltainer">

        <p class="centered">De regenton is a community staking pool on Gnosis chain. All rewards go to the playground.</p>

        <div id="tvl" class="block">
            <label>TVL</label>
            <div class="number">{@html $regenton.tvl}</div>
        </div>
        <div id="rewards" class="block">
            <label>Rewards</label>
            <div class="number">{@html $regenton.rewards}</div>

        </div>

   

        {#if $state == "spinner"}
            <SpinnerWave></SpinnerWave>
        {:else}
            <div id="mystake"class="centered block">  
                <span>Your current stake is {$currentStake} GNO</span>
                <span>Available to stake: {$availableGNO[TOKENADDRESS]} GNO</span>
             
            </div>

            <button class="pill" on:click={() => handleStake()}>Stake 1 GNO</button>
        {/if}

    </section>


<style>

    p.centered {
        margin: 1.5rem; 
    }


    .number {
        font-size: 3rem;
        font-weight: 700;
        font-family: 'Gotham A', 'GOTHAM B';
        line-height: 1;
    }

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center
    }

    

    #tvl {
        margin-top: 1rem;
        transform: rotate(3deg);
        margin-bottom: 1.5rem;
    }

    #rewards {
        transform: rotate(-5deg);
        margin-bottom: 1.5rem;
    }

    #mystake {
        transform: rotate(1deg);
        margin-bottom: 1.5rem;
    }

    


</style>