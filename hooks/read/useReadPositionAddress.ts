"use client";
import { useAccount, useReadContract } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";

export const useReadAddressPosition = (lendingPoolAddress: string) => {
  const { address } = useAccount();
  
  // Debug logging
  console.log("🔍 useReadAddressPosition Debug:", {
    lendingPoolAddress,
    walletAddress: address,
    isWalletConnected: !!address,
    lendingPoolAddressValid: lendingPoolAddress && lendingPoolAddress !== "0x0000000000000000000000000000000000000000"
  });

  const {
    data: addressPosition,
    isLoading: isLoadingAddressPosition,
    refetch: refetchAddressPosition,
  } = useReadContract({
    address: lendingPoolAddress as `0x${string}`,
    abi: lendingPoolAbi,
    functionName: "addressPositions",
    args: [address as `0x${string}`],
    query: {
      enabled: Boolean(address && lendingPoolAddress && lendingPoolAddress !== "0x0000000000000000000000000000000000000000"),
    },
  });

  // Debug logging for results
  console.log("📍 Position Address Result:", {
    addressPosition: addressPosition?.toString(),
    isLoadingAddressPosition,
    hasPosition: addressPosition && addressPosition !== "0x0000000000000000000000000000000000000000"
  });

  return {
    addressPosition,
    isLoadingAddressPosition,
    refetchAddressPosition,
  };
};
