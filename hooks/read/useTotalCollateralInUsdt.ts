import React from "react";
import { Address, formatUnits } from "viem";
import { EnrichedPool } from "@/lib/pair-token-address";
import { tokens } from "@/constants/tokenAddress";
import { defaultChain } from "@/lib/get-default-chain";
import { useReadAddressPosition } from "@/hooks/read/useReadPositionAddress";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { useTokenCalculator } from "@/hooks/read/useTokenCalculator";

export function useTotalCollateralInUsdt(pool: EnrichedPool | null) {
  const lendingPoolAddress =
    (pool?.id as `0x${string}`) || ("0x0000000000000000000000000000000000000000" as `0x${string}`);

  const { addressPosition } = useReadAddressPosition(lendingPoolAddress);
  const positionAddress =
    (addressPosition as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`);

  const usdtToken = tokens.find((t) => t.symbol === "USDT");
  const usdtAddress =
    (usdtToken?.addresses?.[defaultChain] as Address) ||
    ("0x0000000000000000000000000000000000000000" as Address);

  // Call hooks for each token at the top level
  const wethToken = tokens.find((t) => t.symbol === "WETH");
  const wethAddress = wethToken?.addresses?.[defaultChain] as `0x${string}`;
  const { positionBalance: wethBalance } = useReadPositionBalance(wethAddress, positionAddress);
  const wethParsed = wethBalance ? Number(formatUnits(wethBalance as bigint, wethToken?.decimals || 18)) : 0;
  const { price: wethInUsdt } = useTokenCalculator(
    wethAddress as Address,
    usdtAddress,
    wethParsed,
    positionAddress as Address,
    { refetchIntervalMs: 5000, staleTimeMs: 3000 }
  );

  const wbtcToken = tokens.find((t) => t.symbol === "WBTC");
  const wbtcAddress = wbtcToken?.addresses?.[defaultChain] as `0x${string}`;
  const { positionBalance: wbtcBalance } = useReadPositionBalance(wbtcAddress, positionAddress);
  const wbtcParsed = wbtcBalance ? Number(formatUnits(wbtcBalance as bigint, wbtcToken?.decimals || 8)) : 0;
  const { price: wbtcInUsdt } = useTokenCalculator(
    wbtcAddress as Address,
    usdtAddress,
    wbtcParsed,
    positionAddress as Address,
    { refetchIntervalMs: 5000, staleTimeMs: 3000 }
  );

  const usdcToken = tokens.find((t) => t.symbol === "USDC");
  const usdcAddress = usdcToken?.addresses?.[defaultChain] as `0x${string}`;
  const { positionBalance: usdcBalance } = useReadPositionBalance(usdcAddress, positionAddress);
  const usdcParsed = usdcBalance ? Number(formatUnits(usdcBalance as bigint, usdcToken?.decimals || 6)) : 0;
  const { price: usdcInUsdt } = useTokenCalculator(
    usdcAddress as Address,
    usdtAddress,
    usdcParsed,
    positionAddress as Address,
    { refetchIntervalMs: 5000, staleTimeMs: 3000 }
  );

  const usdtTokenForBalance = tokens.find((t) => t.symbol === "USDT");
  const usdtAddressForBalance = usdtTokenForBalance?.addresses?.[defaultChain] as `0x${string}`;
  const { positionBalance: usdtBalance } = useReadPositionBalance(usdtAddressForBalance, positionAddress);
  const usdtParsed = usdtBalance ? Number(formatUnits(usdtBalance as bigint, usdtTokenForBalance?.decimals || 6)) : 0;
  const { price: usdtInUsdt } = useTokenCalculator(
    usdtAddressForBalance as Address,
    usdtAddress,
    usdtParsed,
    positionAddress as Address,
    { refetchIntervalMs: 5000, staleTimeMs: 3000 }
  );

  const totalInUsdt = React.useMemo(
    () => [
      wethInUsdt || 0,
      wbtcInUsdt || 0,
      usdcInUsdt || 0,
      usdtInUsdt || 0
    ].reduce((acc, amount) => acc + (Number.isFinite(amount) ? amount : 0), 0),
    [wethInUsdt, wbtcInUsdt, usdcInUsdt, usdtInUsdt]
  );

  return { totalInUsdt };
}
