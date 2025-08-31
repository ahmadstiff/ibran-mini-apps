import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useTotalCollateralInUsdt } from "@/hooks/read/useTotalCollateralInUsdt";
import { useReadUserBorrowShares } from "@/hooks/read/useUserBorrowShares";
import { useReadHealthFactor } from "@/hooks/read/useReadHealthFactor";
import { EnrichedPool } from "@/lib/pair-token-address";
import { useAccount } from "wagmi";
import { Name } from "@coinbase/onchainkit/identity";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

interface StatsCardProps {
  pool: EnrichedPool | null;
}

export const StatsCard: React.FC<StatsCardProps> = ({ pool }) => {
  const { isConnected } = useAccount();

  // Always call hooks with default values to maintain hook order
  const poolId = (pool?.id as `0x${string}`) || "0x0000000000000000000000000000000000000000";
  const borrowTokenDecimals = pool?.borrowTokenInfo?.decimals || 18;

  const { totalInUsdt } = useTotalCollateralInUsdt(pool);

  const { userBorrowSharesParsed, userBorrowSharesLoading } = useReadUserBorrowShares(
    poolId,
    borrowTokenDecimals
  );

  const {
    healthFactor,
    isLoadingHealthFactor,
    error: healthFactorError,
  } = useReadHealthFactor(poolId);

  const formatCollateralAmount = () => {
    if (!pool) return "-";
    if (!Number.isFinite(totalInUsdt) || totalInUsdt === 0) return "0";
    return totalInUsdt.toFixed(2);
  };

  const formatBorrowAmount = () => {
    if (userBorrowSharesLoading) return <Spinner size="sm" className="text-green-400" />;
    if (!userBorrowSharesParsed || userBorrowSharesParsed === 0) return "0";
    return userBorrowSharesParsed.toFixed(4);
  };

  const formatHealthFactor = () => {
    if (isLoadingHealthFactor) return <Spinner size="sm" className="text-cyan-400" />;
    if (healthFactorError || !healthFactor || healthFactor === BigInt(0)) return "0";

    // Convert from wei to readable format (assuming health factor is in wei)
    const healthFactorNumber = Number(healthFactor) / 1e8;
    return healthFactorNumber.toFixed(2);
  };

  // Show wallet connection requirement if user is not connected
  if (!isConnected) {
    return (
      <Card className="w-full max-w-full bg-gray-900 text-gray-100 shadow-xl border border-cyan-800">
        <CardContent className="w-full flex flex-col mx-auto px-6 py-8 justify-center items-center">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <span className="text-2xl">🔗</span>
            </div>
            <span className="text-gray-300 text-lg font-semibold block">
              Connect Your Wallet
            </span>
            <span className="text-gray-400 text-sm mt-2 block">
              Connect your wallet to view your stats
            </span>
          </div>
          <div className="">
            <ConnectWallet>
              <Name className="text-inherit" />
            </ConnectWallet>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pool) {
    return (
      <Card className="w-full max-w-full bg-gray-900 text-gray-100 shadow-xl border border-cyan-800">
        <CardContent className="w-full flex flex-row mx-auto px-6 py-6 justify-between items-center">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm font-medium mb-2">Collateral USDT</span>
            <span className="text-blue-400 font-bold text-lg">-</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm font-medium mb-2">Your Debt</span>
            <span className="text-green-400 font-bold text-lg">-</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-sm font-medium mb-2">Health Factor</span>
            <span className="text-cyan-400 font-bold text-lg">-</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full bg-gray-900 text-gray-100 shadow-xl border border-cyan-800">
      <CardContent className="w-full flex flex-row mx-auto px-6 py-6 justify-between items-center">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-medium mb-2"> Collateral USDT</span>
          <span className="text-blue-400 font-bold text-lg">{formatCollateralAmount()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-medium mb-2">Your Debt</span>
          <span className="text-green-400 font-bold text-lg">{formatBorrowAmount()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-medium mb-2">Health Factor</span>
          <span className="text-cyan-400 font-bold text-lg">{formatHealthFactor()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
