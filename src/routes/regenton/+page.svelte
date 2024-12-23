<script lang="ts">

    import { writable, type Writable } from "svelte/store";
    import { safe_store, waitForSafeStoreToBePopulated, safe_addresses, parseSafeAddress, findAddressByChain, findSrvByChain } from '$lib/store/safe.store';
    import type { SafeService } from "$lib/safe.service";
    import { regenton_abi } from "$lib/regenton_abi";
    import { onMount } from "svelte";
    import { validators_api } from "$lib/apis";
    import SpinnerWaveHuge from "$lib/components/SpinnerWaveHuge.svelte";
    import { GNOTOKENADDRESS, REGENPIJP } from "$lib/constants";

    const state = writable("");
    const regenton: any = writable({});
    const currentStake = writable(0);
    const availableGNO: Writable<Record<string, number>> = writable({});

    const getStake = async (safe_address: string, srv: SafeService) => {
        return await srv.genericCall(REGENPIJP, regenton_abi, "balanceOf", [safe_address]);
    }

    async function getInfo(safe_address: string, srv: SafeService) : Promise<number> {

        return new Promise(async (resolve) => {
            const r = await getStake(safe_address, srv);
            resolve(parseFloat(r))
        })
    }

    async function init() {

        const prefixed_address =(await findAddressByChain("gnosis"));
        if(prefixed_address) {
            const { chain, address} = parseSafeAddress(prefixed_address);
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
                                console.log(available);
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
        init();
    })


    const handleStake = async () => {

        const tokenAbi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const srv = await findSrvByChain("gnosis");

        if(srv) {
            state.set("spinner");
            await srv.genericTx(GNOTOKENADDRESS, tokenAbi, "approve", [REGENPIJP,BigInt(1 * 10 ** 18)], false, undefined, false);
            await srv.genericTx(REGENPIJP, regenton_abi, "mintPlgGNO", [], false, undefined, false);
            init();
            state.set("");
        }
    }

</script> 

    <h2>Regenton</h2>

    <section class="scrolltainer">

        <article>

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
                <SpinnerWaveHuge></SpinnerWaveHuge>
            {:else}
                <div id="mystake"class="centered block">  
                    <span>Your stake is {$currentStake} GNO</span>
                    <span>Available to stake: {$availableGNO[GNOTOKENADDRESS]} GNO</span>
                
                </div>

                <button id="stake" class="pill" on:click={() => handleStake()}>Stake 1 GNO</button>
            {/if}

        </article>

    </section>


<style>

    article {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin: 1.5rem 0;
        width: 100%;
        height: 100%;
    }

    p.centered {
        margin: 1.5rem; 
        line-height: 1.33;
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
        width: calc(100% - 4rem);
    }

    #stake {
        margin-bottom: 1.5rem;
        
    }

</style>