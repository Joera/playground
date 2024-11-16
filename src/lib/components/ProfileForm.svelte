<script lang="ts">
    
    import { avatar_store, circles_sdk_store } from "$lib/avatar.store";
    import { GnosisChainConfig } from "$lib/circles.factory";
    import { cidToBytes32, ipfs_add } from "$lib/ipfs.factory";
    import { safe_store } from "$lib/safe.store";
    import type { Profile } from "@circles-sdk/profiles";

    export let profile: any;
    export let friend_address: string;

    const handleProfile = async (event: any) => {

        let formData: any = {};      
        event.preventDefault(); 
        const data = new FormData(event.target);
        formData = Object.fromEntries(data.entries());

        const newProfile: Profile = {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.image, 
        };

        // const cid = await ipfs_add(newProfile);
        const cid = "QmUrU11u74YrLbj9d1Z9JvPPZ2nXmgMVTgh2ZvjrTUc4ZQ";
        const hubv2Address = "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8";

        const abi = [
            {
                "inputs": [
                    { "internalType": "address", "name": "_inviter", "type": "address" },
                    { "internalType": "bytes32", "name": "_metadataDigest", "type": "bytes32" }
                ],
                "name": "registerHuman",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        console.log('friend: ' +friend_address);

        avatar_store.subscribe(async (_astore) => {
           
            const address = Object.keys(await _astore)[0];

            safe_store.subscribe(async (store) => {

                const safeService = (await store)[address];
                
                safeService.subscribe(async (srv) => {

                    const r = await srv.genericTx(hubv2Address, abi, "registerHuman", [friend_address, cidToBytes32(cid)], false);
                    console.log(r);
                })
            })

            // circles_sdk_store.subscribe(async (store) => {
            //     console.log(address);

            //     const sdk = (await store)[address];
            //     console.log(sdk);
            //     const r = await sdk.acceptInvitation(cid);
            //     console.log(r)
            // })  

        });
    }

</script>


<form id="profile" on:submit={handleProfile}>

    <label>
        What is your name?
        <input type="text" name="name" id="name" placeholder="Name">
    </label>
    <label>
        What do you do?
        <input type="text" name="description" id="name" placeholder="Description">
    </label>
    <label>
        Image
        <input type="text" name="image" id="name" placeholder="Image">
    </label>

    <button type="submit">submit</button>
</form>


<style>

    form {

        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1.5rem;

        label {
            position: relative;
            margin-bottom: .75rem;
            width: calc(100% - 8rem);
        }

        input {
            border: 1px white solid;
            margin-top: .25rem;
            margin-bottom: .5rem;
            width: 100%;
        }

        button {
            margin-top: .25rem;
        }
    }


</style>

