import { clearPK } from "$lib/store/key.store";
import { clearSafeStore, safe_addresses } from "$lib/store/safe.store";
import { setCirclesListener } from "./circles.factory";
import { initSafeServices } from "./safe.factory";

export const initApp = async () => {
    
    console.log('init app')
    await initSafeServices();
    console.log('finished init safe services')

    setCirclesListener();
   
}
export const clearApp = () => {
    
    localStorage.clear();
    clearSafeStore();
    clearPK();
}