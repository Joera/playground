import { setCirclesListener } from "./circles.factory";
import { initSafeServices } from "./safe.factory";

export const initApp = async () => {
    
    console.log('init app')
    await initSafeServices();
    console.log('finished init safe services')
    setCirclesListener();
}