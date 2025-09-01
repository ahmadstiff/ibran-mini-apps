"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { toast } from "sonner";
import { tokens } from "@/constants/tokenAddress";
import { useSwapToken } from "@/hooks/useSwapToken";
import { useTokenCalculator } from "@/hooks/read/useTokenCalculator";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { defaultChain } from "@/lib/get-default-chain";
import { getPools } from "@/lib/get-pools";
import { useReadAddressPosition } from "@/hooks/read/useReadPositionAddress";

function toHexString(address: string | undefined): `0x${string}` {
  if (!address || !address.startsWith("0x")) {
    throw new Error("Address must be defined and start with 0x");
  }
  return address as `0x${string}`;
}

export const useSwapLogic = () => {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isMounted, setIsMounted] = useState(false);
  const [positionAddress, setPositionAddress] = useState<string | undefined>(
    undefined,
  );
  const [positionLength, setPositionLength] = useState(0);
  const [positionsArray, setPositionsArray] = useState<any[]>([]);
  const [lpAddress, setLpAddress] = useState<any[]>([]);
  const [lpAddressSelected, setLpAddressSelected] = useState<string>("");
  const [positionIndex, setPositionIndex] = useState<number | undefined>(
    undefined,
  );
  const [selectedCollateralToken, setSelectedCollateralToken] =
    useState<any>(null);

  // Use real API pools data
  const [pools, setPools] = useState<any[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);

  // Helper function to get pool by ID
  const getPoolById = (id: string) => {
    return pools.find((pool) => pool.id === id);
  };

  const { addressPosition } = useReadAddressPosition(lpAddressSelected);

  // Validate that tokens have addresses for the current chain
  const fromTokenAddress = fromToken.addresses?.[defaultChain];
  const toTokenAddress = toToken.addresses?.[defaultChain];

  // Check if tokens are valid for the current chain
  const areTokensValid = Boolean(fromTokenAddress && toTokenAddress);

  if (!areTokensValid) {
    console.warn(`Token addresses not found for chain ${defaultChain}`);
  }

  const { positionBalance: fromTokenBalance } = useReadPositionBalance(
    fromTokenAddress || "",
    addressPosition || "",
  );

  const { positionBalance: toTokenBalance } = useReadPositionBalance(
    toTokenAddress || "",
    addressPosition || "",
  );

  const {
    userCollateral,
    positionLoading,
    collateralLoading,
    positionError,
    collateralError,
  } = useReadUserCollateral(
    selectedCollateralToken && selectedCollateralToken.startsWith("0x")
      ? (selectedCollateralToken as `0x${string}`)
      : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    lpAddressSelected && lpAddressSelected.startsWith("0x")
      ? (lpAddressSelected as `0x${string}`)
      : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    fromToken.decimals,
  );

  const {
    price: priceExchangeRate,
    isLoading: isLoadingPrice,
    error: errorPrice,
  } = useTokenCalculator(
    (fromTokenAddress || "") as Address,
    (toTokenAddress || "") as Address,
    1,
    addressPosition as Address,
  );

  const {
    price: priceExchangeRateReverse,
    isLoading: isLoadingPriceReverse,
    error: errorPriceReverse,
  } = useTokenCalculator(
    (fromTokenAddress || "") as Address,
    (toTokenAddress || "") as Address,
    Number(fromAmount) || 0,
    addressPosition as Address,
  );

  const { swapToken, isLoading, error, setError } = useSwapToken({
    fromToken: {
      address: toHexString(fromTokenAddress),
      name: fromToken.name,
      decimals: fromToken.decimals,
    },
    toToken: {
      address: toHexString(toTokenAddress),
      name: toToken.name,
      decimals: toToken.decimals,
    },
    fromAmount,
    toAmount,
    onSuccess: () => {
      setFromAmount("");
      setToAmount("");
    },
    positionAddress: addressPosition as `0x${string}`,
    lendingPoolAddress: lpAddressSelected as `0x${string}`,
  });

  // Set mounted state to true after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchSelectedCollateralToken = async () => {
      if (lpAddressSelected) {
        const pool = getPoolById(lpAddressSelected);
        setSelectedCollateralToken(pool?.collateralToken || null);
      }
    };
    fetchSelectedCollateralToken();
  }, [lpAddressSelected, getPoolById]);

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromAmount && priceExchangeRate && priceExchangeRateReverse) {
      try {
        const amount = parseFloat(fromAmount);
        if (!isNaN(amount) && amount > 0) {
          const calculatedAmount = Number(priceExchangeRateReverse);
          setToAmount(calculatedAmount.toFixed(6));
        } else {
          setToAmount("");
        }
      } catch (err) {
        setToAmount("");
      }
    } else {
      setToAmount("");
      setError("");
    }
  }, [
    fromAmount,
    priceExchangeRate,
    priceExchangeRateReverse,
    fromToken,
    toToken,
  ]);

  // Fetch pools on component mount
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setPoolsLoading(true);
        const poolsData = await getPools();
        setPools(poolsData);
      } catch (error) {
        setPools([]);
      } finally {
        setPoolsLoading(false);
      }
    };

    fetchPools();
  }, []);

  useEffect(() => {
    const fetchLpAddress = async () => {
      try {
        setPositionsArray([]);
        setPositionLength(0);
        setPositionAddress(undefined);

        // Use pools from real API data
        setLpAddress(pools);

        // Auto-select first pool if no pool is selected
        if (pools.length > 0 && !lpAddressSelected) {
          setLpAddressSelected(pools[0].id);
        }
      } catch (error) {
        setLpAddress([]);
      }
    };
    fetchLpAddress();
  }, [pools, lpAddressSelected]);

  // Utility functions - use enriched pool data instead of searching tokens array
  const tokenName = (address: string) => {
    // First try to find in current pools
    for (const pool of pools) {
      if (pool.collateralToken?.toLowerCase() === address?.toLowerCase()) {
        return pool.collateralTokenInfo?.name;
      }
      if (pool.borrowToken?.toLowerCase() === address?.toLowerCase()) {
        return pool.borrowTokenInfo?.name;
      }
    }

    // Fallback to tokens array
    const token = tokens.find(
      (token) => token.addresses[defaultChain] === address,
    );
    return token?.name;
  };

  const tokenLogo = (address: string) => {
    // First try to find in current pools
    for (const pool of pools) {
      if (pool.collateralToken?.toLowerCase() === address?.toLowerCase()) {
        return pool.collateralTokenInfo?.logo;
      }
      if (pool.borrowToken?.toLowerCase() === address?.toLowerCase()) {
        return pool.borrowTokenInfo?.logo;
      }
    }

    // Fallback to tokens array
    const token = tokens.find(
      (token) => token.addresses[defaultChain] === address,
    );
    return token?.logo;
  };

  const formatBalance = (
    name: string,
    tokenAddress: string,
    decimals: number,
    tokenBalance: number,
  ) => {
    const formattedBalance =
      name === tokenName(tokenAddress)
        ? (tokenBalance / 10 ** decimals).toFixed(6)
        : tokenBalance.toString();
    return `${formattedBalance} ${name}`;
  };

  const switchTokens = () => {
    // Only allow switching if both tokens are valid for the current chain
    if (areTokensValid) {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
    }
  };

  const formatExchangeRate = (price: number) => {
    return `1 ${fromToken.name} ≈ ${
      isLoadingPrice ? "Loading..." : Number(price).toFixed(6)
    } ${toToken.name}`;
  };

  const handleSwap = async () => {
    // Check if tokens are valid for the current chain
    if (!areTokensValid) {
      setError("Selected tokens are not available on this network");
      return;
    }

    const fromAmountReal = parseFloat(fromAmount) * 10 ** fromToken.decimals;
    const fromTokenBalanceReal =
      fromToken.name === tokenName(selectedCollateralToken)
        ? Number(userCollateral?.toString() ?? "0")
        : Number(fromTokenBalance) * 10 ** fromToken.decimals;

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!fromAmountReal || fromAmountReal <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (fromAmountReal > Number(fromTokenBalanceReal)) {
      setError("Insufficient balance");
      return;
    }

    try {
      await swapToken();
      toast.success("Swap completed successfully!", {
        style: {
          background: "rgba(34, 197, 94, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#86efac",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.1)",
        },
      });
    } catch (err) {
      toast.error("Swap failed. Please try again.");
    }
  };

  const getButtonText = () => {
    if (!isMounted) return "Swap";
    if (!address) return "Connect Wallet";
    if (!areTokensValid) return "Invalid Tokens";
    if (
      !addressPosition ||
      addressPosition === "0x0000000000000000000000000000000000000000"
    ) {
      return "Create Position First";
    }
    if (isLoading) return "Processing...";
    return "Swap";
  };

  const formatButtonClick = () => {
    if (
      addressPosition === "0x0000000000000000000000000000000000000000" ||
      addressPosition === undefined
    ) {
      // Silent fail for no active positions
    } else if (
      Number(fromAmount) >
      Number(fromTokenBalance) / 10 ** fromToken.decimals
    ) {
      // Silent fail for insufficient balance
    } else {
      handleSwap();
    }
  };

  const formatButtonClassName = () => {
    return `w-full py-3.5 rounded-xl font-bold transition-colors ${
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !address ||
      addressPosition === undefined ||
      addressPosition === "0x0000000000000000000000000000000000000000" ||
      Number(fromAmount) > Number(fromTokenBalance) / 10 ** fromToken.decimals
        ? "bg-blue-600/30 text-white shadow-md hover:shadow-lg cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg"
    }`;
  };

  return {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    isMounted,
    lpAddress,
    lpAddressSelected,
    addressPosition,
    selectedCollateralToken,
    fromTokenBalance,
    toTokenBalance,
    userCollateral,
    priceExchangeRate,
    isLoading,
    error,
    address,
    areTokensValid,
    poolsLoading,

    // Setters
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    setLpAddressSelected,

    // Functions
    tokenName,
    tokenLogo,
    formatBalance,
    switchTokens,
    formatExchangeRate,
    handleSwap,
    getButtonText,
    formatButtonClick,
    formatButtonClassName,
  };
};
