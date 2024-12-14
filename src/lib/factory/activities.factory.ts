import { findSrvByChain, waitForSafeStoreToBePopulated } from "$lib/store/safe.store";
import { ethers } from "ethers";
import { safe_store, safe_addresses } from "$lib/store/safe.store";
import { get } from "svelte/store";

export const fetchActivities = async () => {

    const txs = [];
    await waitForSafeStoreToBePopulated(get(safe_store), get(safe_addresses));
    
    const srv = await findSrvByChain("gnosis");
    
    if(srv) {

        const txs_query = await srv.getCircleTxs();

        while (await txs_query.queryNextPage()) {
            const resultRows = txs_query.currentPage?.results ?? [];
            if (resultRows.length === 0)
                break;
            txs.push(...resultRows);
            if (resultRows.length < 1000)
                break;
        }

        // console.log(txs);

        for (let tx of txs) {

            delete tx.attoCircles;
            delete tx.attoCrc;
            delete tx.staticAttoCircles;
            
            if (tx.to != "0x0000000000000000000000000000000000000000" && ethers.getAddress(tx.to) != srv.safe_address){  
                tx.toName = await srv.getAvatarName(tx.to)
            }

            else if (ethers.getAddress(tx.from) == srv.safe_address && tx.to == "0x0000000000000000000000000000000000000000" && tx.circles == 96) {
                tx.toName = await srv.getAvatarName(tx.operator)
            }

            else if (ethers.getAddress(tx.to) == srv.safe_address) {
                tx.toName = await srv.getAvatarName(tx.to)
            }
        } 
    }

    return txs;
        
}

export const formatDate = (timestamp:  number) => {

    const date = new Date(timestamp * 1000);

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
}