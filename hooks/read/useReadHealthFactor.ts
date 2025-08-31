"use client";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/constants/tokenAddress";

export const useReadHealthFactor = (lendingPoolAddress: string) => {
  const { address } = useAccount();

  const {
    data: healthFactor,
    isLoading: isLoadingHealthFactor,
    refetch: refetchHealthFactor,
    error: healthFactorError,
  } = useReadContract({
    address: helperAddress as `0x${string}`,
    abi: helperAbi,
    functionName: "getHealthFactor",
    args: [lendingPoolAddress as `0x${string}`, address as `0x${string}`],
  });
  return {
    healthFactor,
    isLoadingHealthFactor,
    refetchHealthFactor,
    error: healthFactorError,
  };
};
