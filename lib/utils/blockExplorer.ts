export const getBlockExplorerUrl = (chainId: number, txHash: string) => {
  const explorers = {
    84532: "https://base-sepolia.blockscout.com",
  };

  const baseUrl =
    explorers[chainId as keyof typeof explorers] ||
    "https://base-sepolia.blockscout.com";
  return `${baseUrl}/tx/${txHash}`;
};
