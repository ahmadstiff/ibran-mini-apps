import { helperAddress, tokens } from "@/constants/tokenAddress";
import { helperAbi } from "@/lib/abis/helperAbi";
import { defaultChain } from "@/lib/get-default-chain";
import { Address } from "viem";
import { useReadContract } from "wagmi";

type TokenCalculatorOptions = {
  enabled?: boolean;
  refetchIntervalMs?: number;
  staleTimeMs?: number;
  gcTimeMs?: number;
};

export const useTokenCalculator = (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: number,
  addressPosition: Address,
  options: TokenCalculatorOptions = {},
) => {
  const decimalsIn = tokens.find(
    (token) => token.addresses[defaultChain] === tokenIn,
  )?.decimals;
  const decimalsOut = tokens.find(
    (token) => token.addresses[defaultChain] === tokenOut,
  )?.decimals;

  // Normalize amount to reduce query key churn and lighten RPC load
  const precision = Math.min(decimalsIn ?? 0, 4);
  const normalizedAmount =
    Number.isFinite(amountIn) && amountIn > 0 ? amountIn : 0;
  const roundedAmount =
    Math.round(normalizedAmount * 10 ** precision) / 10 ** precision;
  const amountInBigInt = BigInt(
    Math.round(roundedAmount * 10 ** (decimalsIn ?? 0)),
  );
  const tokenInPrice = tokens.find(
    (token) => token.addresses[defaultChain] === tokenIn,
  )?.priceFeed[defaultChain] as Address;
  const tokenOutPrice = tokens.find(
    (token) => token.addresses[defaultChain] === tokenOut,
  )?.priceFeed[defaultChain] as Address;


  const {
    data: price,
    isLoading,
    error,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getExchangeRate",
    args: [tokenIn, tokenOut, amountInBigInt, addressPosition],
    query: {
      enabled:
        options.enabled ??
        Boolean(tokenIn && tokenOut && addressPosition && roundedAmount >= 0),
      refetchInterval: options.refetchIntervalMs ?? 5000, // poll every 5s
      staleTime: options.staleTimeMs ?? 3000, // cache result for 3s
      gcTime: options.gcTimeMs ?? 60_000, // keep in cache for 60s
      refetchOnWindowFocus: false,
    },
  });

  const calculatedPrice = price ? Number(price) / 10 ** (decimalsOut ?? 0) : 0;


  return {
    price: calculatedPrice,
    isLoading: isLoading,
    error: error,
  };
};
