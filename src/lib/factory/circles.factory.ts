import type {CirclesConfig} from "@circles-sdk/sdk";
import { circles_addresses, safe_store } from "../store/safe.store";
import type { SafeService } from "../safe.service";
import { getDefaultProvider, ethers } from "ethers";
import { hexToAddress } from "../factory/eth.factory";
import { events } from "../store/event.store";


// export const GnosisChainConfig: CirclesConfig = {
//     circlesRpcUrl: "https://rpc.aboutcircles.com/",
//     pathfinderUrl: "https://pathfinder.aboutcircles.com",
//     v1HubAddress: "0x29b9a7fbb8995b2423a71cc17cf9810798f6c543",
//     v2HubAddress: "0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8",
//     nameRegistryAddress: "0xA27566fD89162cC3D40Cb59c87AAaA49B85F3474",
//     migrationAddress: "0xD44B8dcFBaDfC78EA64c55B705BFc68199B56376",
//     profileServiceUrl: "https://rpc.aboutcircles.com/profiles/",
// };

export const setCirclesListener = () => {

    let listening = false;

    circles_addresses.subscribe(async (addresses) => {

        if (!listening && addresses.length > 0 && addresses[0] != undefined) {

            console.log("circles_addresses", addresses);

            safe_store.subscribe(async (stores) => {

                const safeService = (await stores)["gnosis"];

                if (!safeService) return;

                safeService.subscribe(async (srv) => {

                    const provider = getDefaultProvider('wss://rpc.gnosischain.com/wss');
                    const contractAddress = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8';
                    const contractABI = [
                        "event Trust(address indexed truster, address indexed trustee, uint256 expiryTime)"
                    ];

                    const contract = new ethers.Contract(contractAddress, contractABI, provider);

                    const filter = contract.filters.Trust(null, ethers.getAddress(addresses[0]), null);

                    contract.on(filter, async (event: any, log: any) => {

                        if (ethers.getAddress(event.log.address) != ethers.getAddress(contractAddress)) return;
                        
                        const truster = hexToAddress(event.log.topics[1])
                        console.log("trust detected from ", truster);
                        const name = await srv.getAvatarName(truster);

                        const e = {
                            msg : `${name} trusts you. Accept?`,
                            method: 'accept_invite',
                            address: truster
                        }

                        events?.update((eventsString) => {
                            let events = eventsString != "" ? JSON.parse(eventsString) : [];
                            events = [...events, e]
                            return JSON.stringify(events);
                        });
                        
                    });

                    listening = true;
                    console.log('listening to events for ', addresses[0]);
                });
            });
        }
    });
}


// export const hasSafeWithAvatar = async (address: string) => {

//     let safesWithAvatars: string[] = [];
    
//     console.log("len: " + Object.keys(safe_store).length);
//         for (const safe of Object.keys(safe_store)) {
//             let b = await new Promise(resolve => {
//                 safe_store[safe].subscribe(async (safeService: SafeService) => {
//                     const hasAvatar = await safeService.hasAvatar();
//                     resolve(hasAvatar);
//                 });
//             });
//             console.log(b)
//             if (b) {
//                 safesWithAvatars.push(safe);
//             }
//         }
// }

// export const acceptInvite =  async (inviterAddress: string) => {

//     const a = await avatar.acceptInvitation(inviterAddress,"Qm.....");
//     console.log(a.avatar.avatarInfo);
// }

// export const getMintableAmount = async (tokenId: string) => {
//     const a = await avatar.getMintableAmount();
//     return a;
// }

// export const mint = async (sdk: S) => {

//     const mintTransaction = await sdk.personalMint();
//     console.log('Transaction successful, receipt:', mintTransaction);

// }