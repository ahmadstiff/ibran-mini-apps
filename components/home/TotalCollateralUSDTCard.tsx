import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnrichedPool } from "@/lib/pair-token-address";
import { useReadAddressPosition } from "@/hooks/read/useReadPositionAddress";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { useTokenCalculator } from "@/hooks/read/useTokenCalculator";
import { tokens } from "@/constants/tokenAddress";
import { defaultChain } from "@/lib/get-default-chain";
import { Address, formatUnits } from "viem";

interface TotalCollateralUSDTCardProps {
  pool: EnrichedPool | null;
}

export const TotalCollateralUSDTCard: React.FC<TotalCollateralUSDTCardProps> = ({ pool }) => {
  // Guard: pool must be selected to derive lending pool address
  const lendingPoolAddress =
    (pool?.id as `0x${string}`) || "0x0000000000000000000000000000000000000000";

  // Resolve user's position address for the selected pool
  const { addressPosition } = useReadAddressPosition(lendingPoolAddress);
  const positionAddress =
    (addressPosition as `0x${string}`) || "0x0000000000000000000000000000000000000000";

  // Resolve USDT address for the active chain
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

  // Calculate total in USDT
  const totalInUsdt = [
    wethInUsdt || 0,
    wbtcInUsdt || 0,
    usdcInUsdt || 0,
    usdtInUsdt || 0
  ].reduce((acc, amount) => acc + (Number.isFinite(amount) ? amount : 0), 0);

  // Loading state: if no pool selected
  if (!pool) {
    return (
      <Card className="border border-cyan-800 py-2 w-full max-w-full bg-gray-900 text-gray-100 shadow-xl">
        <CardContent className="w-full flex flex-row mx-auto px-6 py-3 justify-between items-center">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm font-medium">Collateral (USDT)</span>
            <span className="text-white font-bold text-lg">-</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-cyan-800 py-2 w-full max-w-full bg-gray-900 text-gray-100 shadow-xl">
      <CardContent className="w-full flex flex-row mx-auto px-6 py-3 justify-between items-center">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-medium">Your Total Collateral (USDT)</span>
          <span className="text-white font-bold text-lg">{totalInUsdt.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
