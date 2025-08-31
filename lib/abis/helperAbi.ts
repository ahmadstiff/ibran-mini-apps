export const helperAbi = [
  {
    inputs: [{ name: "_factory", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    outputs: [{ name: "", internalType: "address", type: "address" }],
    inputs: [],
    name: "factory",
    stateMutability: "view",
    type: "function",
  },
  {
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    inputs: [
      { name: "_tokenIn", internalType: "address", type: "address" },
      { name: "_tokenOut", internalType: "address", type: "address" },
      { name: "_amountIn", internalType: "uint256", type: "uint256" },
      { name: "_position", internalType: "address", type: "address" },
    ],
    name: "getExchangeRate",
    stateMutability: "view",
    type: "function",
  },
  {
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    inputs: [
      { name: "_lendingPool", internalType: "address", type: "address" },
      { name: "_user", internalType: "address", type: "address" },
    ],
    name: "getHealthFactor",
    stateMutability: "view",
    type: "function",
  },
  {
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    inputs: [
      { name: "_lendingPool", internalType: "address", type: "address" },
      { name: "_user", internalType: "address", type: "address" },
    ],
    name: "getMaxBorrowAmount",
    stateMutability: "view",
    type: "function",
  },
  {
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    inputs: [{ name: "_token", internalType: "address", type: "address" }],
    name: "getTokenValue",
    stateMutability: "view",
    type: "function",
  },
  {
    outputs: [],
    inputs: [{ name: "_factory", internalType: "address", type: "address" }],
    name: "setFactory",
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
