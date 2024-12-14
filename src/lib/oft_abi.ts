export const oft_abi = [{
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "dstChainId",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "toAddress",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "refundAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "zroPaymentAddress",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "adapterParams",
        "type": "bytes"
      }
    ],
    "name": "sendFrom",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }];