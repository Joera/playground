
import { CID } from 'multiformats/cid';

export const ipfs_add = async (object: any) => {

    try {

        const response = await fetch('https://ipfs.autonomous-times.com/api/v0/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(object)
        });

        console.log('IPFS Response:', response);

        if (!response.ok) {
            throw new Error(`Error uploading to IPFS: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('IPFS Hash:', result.Hash);
        return result.Hash; 

    } catch (error) {

        console.error('Upload failed:', error);
        throw error;
    }
}



// Helper function to convert a CID to bytes32-like format
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