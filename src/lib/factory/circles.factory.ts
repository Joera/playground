import { findSrvByChain } from "../store/safe.store";
import { getDefaultProvider, ethers } from "ethers";
import { hexToAddress } from "../factory/eth.factory";
import { events } from "../store/event.store";
import type { SafeService } from "$lib/safe.service";
import type { IToken } from "./token.factory";
import { hubv2_abi } from "$lib/circles_hub_v2";
import { HUBV2ADDRESS } from "$lib/constants";

export const setCirclesListener = async () => {

    let listening = false;

    const srv = await findSrvByChain("gnosis");

    if (srv && !listening) {

        const provider = getDefaultProvider('wss://rpc.gnosischain.com/wss');
        const contractAddress = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8';
        const contractABI = [
            "event Trust(address indexed truster, address indexed trustee, uint256 expiryTime)"
        ];

        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const filter = contract.filters.Trust(null, ethers.getAddress(srv.safe_address), null);
       // const filter = contract.filters.Trust(null, null, null);

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
        console.log('listening to events on gnosis for ', srv.safe_address);
    }
}

export const updateCircleBalances = async (srv: SafeService) => {

        try {

            const balances = await srv.circles_data?.getTokenBalances(srv.safe_address);
            const issuance = await srv.genericCall(HUBV2ADDRESS,hubv2_abi,"calculateIssuance",[srv.safe_address]);
            const mintable = ethers.formatUnits(issuance.split(",")[0], 18);

            function addressToUint256(address: string): string {
                const addressHex = address.startsWith("0x") ? address.slice(2) : address;
                const paddedHex = addressHex.padStart(64, '0');
                return BigInt("0x" + paddedHex).toString();
            }
            
            if (balances) {
                srv.circles.update((circles) => {
                    for (let b of balances) {

                        let t: IToken = {
                            name: srv.safe_address,
                            symbol: "crc",
                            decimals: 18,
                            address: b.tokenId,
                            balance: b.circles.toString(),
                            mintable: "0"
                        }

                        if (mintable != undefined && b.tokenId === addressToUint256(srv.safe_address)) {
                            t.mintable = parseFloat(mintable.toString()).toFixed(0).toString();
                        }

                        circles.set(b.tokenId, t);
                    }

                    // console.log(circles);

                    return circles
                });
            }

        } catch (error) {
            console.log(error)
        }
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