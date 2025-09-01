"use client";
import { useAccount, useReadContract } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";

export const useReadAddressPosition = (lendingPoolAddress: string) => {
  const { address } = useAccount();

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
      enabled: Boolean(
        address &&
          lendingPoolAddress &&
          lendingPoolAddress !== "0x0000000000000000000000000000000000000000",
      ),
    },
  });

  return {
    addressPosition,
    isLoadingAddressPosition,
    refetchAddressPosition,
  };
};
