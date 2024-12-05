
import { CID } from 'multiformats/cid';         
import { kubo_api, cluster_api } from '../apis';

export const add_and_pin = async (object: any)  =>  {

    const cid = await ipfs_add(object);
    return cid;

}

export const ipfs_cat = async (cid: string) => {
    
    const ipfs_response = await kubo_api.post(`/cat?arg=${cid}`);

    if (ipfs_response.status !== 200) {
        throw new Error(`Error uploading to IPFS: ${ipfs_response.statusText}`);
    }

    // console.log('IPFS Response:', ipfs_response);

    return ipfs_response.data;

}

export const ipfs_add = async (object: any) => {

    try {

        const formData = new FormData();
        formData.append('file', JSON.stringify(object));

        const ipfs_response = await kubo_api.post('/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (ipfs_response.status !== 200) {
            throw new Error(`Error uploading to IPFS: ${ipfs_response.statusText}`);
        }

       //  console.log('IPFS Response:', ipfs_response.data);
        return ipfs_response.data["Hash"];

    } catch (error) {

        console.error('Upload failed:', error);
        throw error;
    }
}

export const cluster_pin = async (cid: string) => {

    try { 

        const cluster_response = await cluster_api.post(`/pin/${cid}`, {
         
        });

        if (cluster_response.status !== 200) {
            throw new Error(`Error uploading to IPFS: ${cluster_response.statusText}`);
        }

       //  console.log('IPFS Response:', ipfs_response.data);
        return;
        
        
    } catch (error) {

        console.error('Pin failed:', error);
        throw error;
    }
}

export const cidToBytes32 = (cidStr: string): Uint8Array =>  {
    
  const cid = CID.parse(cidStr);        // Parse CID from the string
  const bytes = cid.bytes.slice(0, 32); // Get the first 32 bytes (truncate if longer)
  
  if (bytes.length < 32) {
    // Pad if it's shorter than 32 bytes
    const paddedBytes = new Uint8Array(32);
    paddedBytes.set(bytes, 32 - bytes.length);
    return paddedBytes;
  }

  return bytes; // Return the 32-byte Uint8Array
}