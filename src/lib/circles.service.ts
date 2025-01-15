import { findSrvByChain } from "./store/safe.store";
import { getDefaultProvider, ethers } from "ethers";
import { addressToUint256, displayShorterAddress, hexToAddress } from "./factory/eth.factory";
import { events } from "./store/event.store";
import type { SafeService } from "$lib/safe.service";
import { hubv2_abi } from "$lib/circles_hub_v2";
import { HUBV2ADDRESS } from "$lib/constants";
import { uint256ToAddress } from "@circles-sdk/utils";
import { circlesStore } from "$lib/store/contacts.store";
import { ipfs_cat } from "./factory/ipfs.factory";

import { type Writable, writable } from "svelte/store";
import { CirclesData, CirclesRpc } from "@circles-sdk/data";
import { updateContacts, type Contact } from "./factory/contact.factory";

export interface ICircle {
    safe: string;
    symbol: string;
    decimals: number;
    tokenId: string;
    issuerAddress: string;
    issuerName?: string;
    balance: string;
    mintable?: string;
    totalBalance: string;
}

export class CirclesService {

    safe: SafeService;
    data_rpc: CirclesData;
    balances: Writable<Map<string, ICircle>> = writable(new Map());
    contacts: Writable<Contact[]> = writable([]);

    constructor(safeSrv: SafeService) {

        this.safe = safeSrv;

        const circlesRpc = new CirclesRpc("https://rpc.aboutcircles.com");
        this.data_rpc = new CirclesData(circlesRpc);
        this.setCirclesListener();
        this.getContacts();
    }

    correctChain = () => {

        return this.safe.chain == "gnosis";
    }

    setCirclesListener = async () => {

        let listening = false;

        if (this.correctChain() && !listening) {
    
            // separate wss provider on safe?  
            const provider = getDefaultProvider('wss://rpc.gnosischain.com/wss');
            const contractAddress = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8';
            const contractABI = [
                "event Trust(address indexed truster, address indexed trustee, uint256 expiryTime)"
            ];
    
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
            const filter = contract.filters.Trust(null, ethers.getAddress(this.safe.safe_address), null);
    
            contract.on(filter, async (event: any, log: any) => {
    
                if (ethers.getAddress(event.log.address) != ethers.getAddress(contractAddress)) return;
                
                const truster = hexToAddress(event.log.topics[1])
                console.log("trust detected from ", truster);
                const name = await this.getAvatarName(truster);
    
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
            console.log('listening to circles trust events on gnosis for ', this.safe.safe_address);
        }
    }

    updateBalances = async () => {

        try {

            const balances = await this.data_rpc?.getTokenBalances(this.safe.safe_address);
            const issuance = await this.safe.genericCall(HUBV2ADDRESS,hubv2_abi,"calculateIssuance",[this.safe.safe_address]);
            const mintable = ethers.formatUnits(issuance.split(",")[0], 18);

            if (balances) {
                this.balances.update( (circles) => {
                    for (let b of balances) {

                        let t: ICircle = {
                            safe: this.safe.safe_address,
                            symbol: "crc",
                            decimals: 18,
                            tokenId: b.tokenId,
                            issuerAddress: uint256ToAddress(BigInt(b.tokenId)),
                            balance: b.circles.toString(),
                            mintable: "0",
                            totalBalance: b.circles.toString()
                        }

                        if (mintable != undefined && b.tokenId === addressToUint256(this.safe.safe_address)) {
                            t.mintable = parseFloat(mintable.toString()).toFixed(0).toString();
                            t.totalBalance = (parseFloat(mintable.toString()) + parseFloat(t.balance)).toFixed(0).toString();
                        }

                        circles.set(b.tokenId, t);
                        
                    }

                    circlesStore.set(circles);
                    return circles
                });
            }

        } catch (error) {
            console.log(error)
        }
    }

    async getAvatarName(address: string) {
        
        let cid;


        // move cirles_Data here
        // have another look at its purpose 
        try {
            cid = await this.data_rpc.getMetadataCidForAddress(address);
        } catch (error) {
            return undefined;
        }

        if (cid != undefined) {

            let profile: any;
            try {
                profile = await ipfs_cat(cid); 
            } catch (error) {
                return displayShorterAddress(address);
            }
            if(profile && profile.name) {
                return profile.name;
            } else {
                return displayShorterAddress(address);
            }    
        }  else {
            undefined
        }  
    }

    sumBalance = () => {  


    }

    async mintCircles() {

        return await this.safe.genericTx(HUBV2ADDRESS, hubv2_abi, "personalMint",[], false);

    }

    async transferCircles(to: string, id: string, value: number) {

        const from = this.safe.safe_address;
        const data = "";

        await this.safe.genericTx(HUBV2ADDRESS, hubv2_abi, "safeTransferFrom",[from, to, id, value, data], false);

        return

    }

    async getTxs() {
        return await this.data_rpc.getTransactionHistory(this.safe.safe_address,100);
    }

    async getEvents() {
        return await this.data_rpc.getEvents(this.safe.safe_address,10000000);
    }

    async getSponsor() {
        return await this.data_rpc.getAvatarInfo(this.safe.safe_address);
    }

    async getNetwork() {
        return await this.data_rpc.getTrustRelations(this.safe.safe_address,100000);
    }

    async getContacts() {
        this.contacts.set(
            await updateContacts(this)
        )
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