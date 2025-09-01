"use client";
import { useReadContract } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/constants/tokenAddress";

export const useReadGasMaster = (
  destinationDomain: bigint,
  userAmount: bigint,
) => {
  const {
    data: gasMaster,
    isLoading: isLoadingGasMaster,
    refetch: refetchGasMaster,
    error: gasMasterError,
  } = useReadContract({
    address: helperAddress as `0x${string}`,
    abi: helperAbi,
    functionName: "getGasMaster",
    args: [destinationDomain as bigint, userAmount as bigint],
    // Disable the query if destination chain is 84532 (Base Sepolia)
    query: {
      enabled: destinationDomain !== BigInt(84532),
    },
  });

  // If destination chain is 84532 (Base Sepolia), return 0 for gas master
  if (destinationDomain === BigInt(84532)) {
    return {
      gasMaster: BigInt(0),
      isLoadingGasMaster: false,
      refetchGasMaster: () => {},
      error: null,
    };
  }

  return {
    gasMaster: gasMaster || BigInt(0),
    isLoadingGasMaster,
    refetchGasMaster,
    error: gasMasterError,
  };
};
