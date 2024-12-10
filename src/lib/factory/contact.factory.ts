import { ethers } from "ethers";
import { hubv2_abi } from "../circles_hub_v2";
import { HUBV2ADDRESS } from "../constants";
import { expiredTimeHex, expiryTimeHex, fixSafeAddress } from "./eth.factory";
import { circles_addresses, hasAvatar } from "../store/safe.store";
import { safe_store } from "../store/safe.store";
import { contacts, hidden_contacts } from "../store/contacts.store";

export type Contact = {
    objectAvatar: string;
    relation: string;
    subjectAvatar: string;
    objectName: string;
}

export const reciprocateTrust = async (objectAddress: string) : Promise<void> => {

    return new Promise((resolve, reject) => {

        circles_addresses.subscribe((addresses) => {
            safe_store.subscribe((safes) => {
                const srv = safes[addresses[0]];
                srv.subscribe(  async (srv) => {
                    const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "trust", [fixSafeAddress(objectAddress), expiryTimeHex()], false);
                    console.log(r)
                    await updateContacts();
                    resolve()
                })
            })
        }) 
    });
}

export const trustChange = async (contact: Contact) : Promise<void> => {

    return new Promise((resolve, reject) => {
        
        circles_addresses.subscribe((addresses) => {
            safe_store.subscribe((safes) => {
                const srv = safes["gnosis"];
                srv.subscribe(  async (srv) => {
                
                    const expiryTime = 
                    (contact.relation === "trusts" || contact.relation === "mutuallyTrusts") 
                    ? expiredTimeHex() : expiryTimeHex();
                    const r = await srv.genericTx(HUBV2ADDRESS, hubv2_abi, "trust", [fixSafeAddress(contact.objectAvatar), expiryTime], false);
                    console.log(r)
                    await updateContacts();
                    resolve();
                })
            })
        }) 
    });
}

export const updateContacts = async () :Promise<Contact[]> => {

    let fetched_contacts: Contact[] = [];

    return new Promise((resolve, reject) => {

        let hidden: string[] = [];
        hidden_contacts?.subscribe((value) => {
            hidden =  []
            try {
                hidden = JSON.parse(value);
             } catch (error) {
                 
             }
        });

        circles_addresses.subscribe((addresses) => {

            const address = ethers.getAddress(addresses[0]);

            safe_store.subscribe((safes) => {
                const srv = safes["gnosis"];
                srv.subscribe(  async (srv) => {

                    hasAvatar.set(await srv.checkAvatar());

                    const trust_query = await srv.getNetwork();

                    const trustListRows = [];
                    while (await trust_query.queryNextPage()) {
                        const resultRows = trust_query.currentPage?.results ?? [];
                        if (resultRows.length === 0)
                            break;
                            trustListRows.push(...resultRows);
                        if (resultRows.length < 1000)
                            break;
                    }

                    const trustBucket : any = {};
                    trustListRows.forEach( (row: any) => {

                        if (ethers.getAddress(row.truster) !== address) {
                            trustBucket[row.truster] = trustBucket[row.truster] || [];
                            if (row.trustee !== row.truster) {
                                trustBucket[row.truster].push(row);
                            }
                        }
                        if (ethers.getAddress(row.trustee) !== address) {
                            trustBucket[row.trustee] = trustBucket[row.trustee] || [];
                            if (row.trustee !== row.truster) {
                                trustBucket[row.trustee].push(row);
                            }
                        }
                    });

                    const format = async (trustBucket: any, addresses: string[]) => { 
                        
                        const contacts: any[] = []; 
                        
                        await Promise.all(
                            Object.entries(trustBucket)
                            .filter(([avatar]) => ethers.getAddress(avatar) !== address)
                            .filter(([avatar]) => ethers.isAddress(avatar))
                            .map( async ([avatar, rows]) => {

                                const maxTimestamp = Math.max(...(rows as any[]).map(o => o.timestamp));

                                let relation;
                                if ((rows as any[]).length === 2) {
                                    relation = 'mutuallyTrusts';
                                }
                                else if (ethers.getAddress((rows as any[])[0].trustee) === address) {
                                    relation = 'trustedBy';
                                }
                                else if (ethers.getAddress((rows as any[])[0].truster) === address) {
                                    relation = 'trusts';
                                }
                                else {
                                    // console.log(avatar)
                                    relation = null  //  throw new Error(`Unexpected trust list row. Couldn't determine trust relation.`);
                                }

                                // console.log(avatar, relation);

                                let o;
                                if(relation != 'trusts') {
                                    o = await srv.getAvatarName(avatar)
                                }

                                // console.log(0, o);

                                if (relation != null) {
                                    contacts.push({
                                        subjectAvatar: "you",
                                        relation: relation,
                                        objectAvatar: avatar,
                                        objectName: o || avatar,
                                        timestamp: maxTimestamp
                                    });
                                }
                            })
                        );
                        return contacts.sort((a, b) => a.objectName.localeCompare(b.objectName)); 
                    }

                    fetched_contacts = await format(trustBucket, addresses);

                    fetched_contacts = fetched_contacts.filter((contact) => {
                        return !hidden.includes(ethers.getAddress(contact.objectAvatar));
                    });

                    if (contacts != undefined) {
                        contacts.set(JSON.stringify(fetched_contacts));
                    }

                    resolve(fetched_contacts)
                    
                });
            });
        })
    })

}

