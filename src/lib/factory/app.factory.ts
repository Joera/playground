import { clearPK, initPK } from "$lib/store/key.store";
import { addSafe, clearSafeStore, findSrvByChain, safe_addresses } from "$lib/store/safe.store";
import { profile_state } from "$lib/store/state.store";
import { setCirclesListener } from "./circles.factory";
import { initSafeServices } from "./safe.factory";

export const initApp = async () => {
    
    console.log('init app')
    await initSafeServices();
    console.log('finished init safe services')

    setCirclesListener(); 
}

export const initAppFromZero = async () => {
    
    await initPK();
    await Promise.all([
        addSafe("gnosis"), 
        addSafe("base")
    ]);

    const srv = await findSrvByChain("base");
    if (srv) {
        await srv.mintNFT();  
        await srv.setDeployed(
            await srv.isDeployed()
        );
    }
 

    setCirclesListener(); 
}



export const clearApp = () => {
    
    localStorage.clear();
    clearSafeStore();
    clearPK();
}