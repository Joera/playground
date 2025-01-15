import { findSrvByChain, waitForSafeStoreToBePopulated } from "$lib/store/safe.store";
import { ethers } from "ethers";
import { safe_store, safe_addresses } from "$lib/store/safe.store";
import { get } from "svelte/store";

export const fetchActivities = async () => {

    const txs = [];
    const formatted = [];
    await waitForSafeStoreToBePopulated(get(safe_store), get(safe_addresses));
    const srv = await findSrvByChain("gnosis");
    
    if(srv) {

        const txs_query = await get(srv.circles).getTxs();

        while (await txs_query.queryNextPage()) {
            const resultRows = txs_query.currentPage?.results ?? [];
            if (resultRows.length === 0)
                break;
            txs.push(...resultRows);
            if (resultRows.length < 1000)
                break;
        }

        for (let tx of txs) {

            let toName;

            if (tx.to != "0x0000000000000000000000000000000000000000" && ethers.getAddress(tx.to) != srv.safe_address){  
                toName = await get(srv.circles).getAvatarName(tx.to)
            }

            else if (ethers.getAddress(tx.from) == srv.safe_address && tx.to == "0x0000000000000000000000000000000000000000" && tx.circles == 96) {
                toName = await get(srv.circles).getAvatarName(tx.operator)

            } else {
                await get(srv.circles).getAvatarName(tx.from)
            }

            let fromName;

            if (ethers.getAddress(tx.to) == srv.safe_address) {
                fromName = await get(srv.circles).getAvatarName(tx.operator)

            } else {
                await get(srv.circles).getAvatarName(tx.to)
            }

            formatted.push({
                timestamp: tx.timestamp,
                fromName,
                toName,
                circles: tx.circles,
                crc: tx.crc,
                batchIndex: tx.batchIndex || 0,
                blockNumber:  tx.blockNumber,
                from: tx.from,
                id: tx.id,
                logIndex: tx.logIndex,
                operator: tx.operator,
                staticCircles: tx.staticCircles,
                to: tx.to,
                tokenType: tx.tokenType,
                transactionHash: tx.transactionHash,
                transactionIndex: tx.transactionIndex,
                type: tx.type,
                value: tx.value,
                version: tx.version

            }); 
        } 
    }

    return formatted;
        
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