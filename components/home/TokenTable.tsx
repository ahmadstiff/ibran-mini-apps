import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useReadAddressPosition } from "@/hooks/read/useReadPositionAddress";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { defaultChain } from "@/lib/get-default-chain";
import { tokens } from "@/constants/tokenAddress";
import { EnrichedPool } from "@/lib/pair-token-address";
import Link from "next/link";
import { RepayDialog } from "@/components/dialog/repay-dialog";
import { useAccount } from "wagmi";

interface TokenTableProps {
  pool: EnrichedPool | null;
}

export const TokenTable: React.FC<TokenTableProps> = ({ pool }) => {
  const [isRepayDialogOpen, setIsRepayDialogOpen] = React.useState(false);
  const [selectedToken, setSelectedToken] = React.useState<typeof tokens[0] | null>(null);
  const { address, isConnected } = useAccount();
  
  const { addressPosition, isLoadingAddressPosition } = useReadAddressPosition(
    pool?.id || "0x0000000000000000000000000000000000000000"
  );

  // Debug logging for TokenTable
  console.log("🪙 TokenTable Debug:", {
    poolId: pool?.id,
    poolExists: !!pool,
    walletAddress: address,
    isWalletConnected: isConnected,
    addressPosition: addressPosition?.toString(),
    isLoadingAddressPosition,
    hasValidPosition: addressPosition && addressPosition !== "0x0000000000000000000000000000000000000000"
  });

  // Get all tokens for current chain
  const chainTokens = tokens.filter(
    (token) =>
      token.addresses[defaultChain] &&
      token.addresses[defaultChain] !== "0x0000000000000000000000000000000000000000"
  );

  // Call hooks for each token at the top level
  const wethToken = chainTokens.find((t) => t.symbol === "WETH");
  const { positionBalance: wethBalance, isLoadingPositionBalance: wethLoading } = useReadPositionBalance(
    wethToken?.addresses[defaultChain] || "0x0000000000000000000000000000000000000000",
    addressPosition || "0x0000000000000000000000000000000000000000"
  );

  const wbtcToken = chainTokens.find((t) => t.symbol === "WBTC");
  const { positionBalance: wbtcBalance, isLoadingPositionBalance: wbtcLoading } = useReadPositionBalance(
    wbtcToken?.addresses[defaultChain] || "0x0000000000000000000000000000000000000000",
    addressPosition || "0x0000000000000000000000000000000000000000"
  );

  const usdcToken = chainTokens.find((t) => t.symbol === "USDC");
  const { positionBalance: usdcBalance, isLoadingPositionBalance: usdcLoading } = useReadPositionBalance(
    usdcToken?.addresses[defaultChain] || "0x0000000000000000000000000000000000000000",
    addressPosition || "0x0000000000000000000000000000000000000000"
  );

  const usdtToken = chainTokens.find((t) => t.symbol === "USDT");
  const { positionBalance: usdtBalance, isLoadingPositionBalance: usdtLoading } = useReadPositionBalance(
    usdtToken?.addresses[defaultChain] || "0x0000000000000000000000000000000000000000",
    addressPosition || "0x0000000000000000000000000000000000000000"
  );

  // Create token balances array with the hook results
  const tokenBalances = [
    { token: wethToken, positionBalance: wethBalance, isLoadingPositionBalance: wethLoading },
    { token: wbtcToken, positionBalance: wbtcBalance, isLoadingPositionBalance: wbtcLoading },
    { token: usdcToken, positionBalance: usdcBalance, isLoadingPositionBalance: usdcLoading },
    { token: usdtToken, positionBalance: usdtBalance, isLoadingPositionBalance: usdtLoading },
  ].filter((item) => item.token); // Filter out undefined tokens

  if (!pool) {
    return (
      <div className="text-center py-8 text-gray-400">Please select a pool to view tokens</div>
    );
  }

  // Check if wallet is connected first
  if (!isConnected) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-lg">🔒</div>
          <div>Please connect your wallet to view position details</div>
          <div className="text-sm text-gray-500">Wallet connection required to access position data</div>
        </div>
      </div>
    );
  }

  if (isLoadingAddressPosition) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <Spinner size="sm" className="text-gray-400" />
          <span>Loading position address...</span>
        </div>
      </div>
    );
  }

  if (!addressPosition || addressPosition === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-lg">📭</div>
          <div>No position found for this pool</div>
          <div className="text-sm text-gray-500">
            Pool: {pool.id?.slice(0, 10)}...{pool.id?.slice(-8)}
          </div>
          <div className="text-sm text-gray-500">
            Wallet: {address?.slice(0, 10)}...{address?.slice(-8)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-blue-400/30 shadow-sm bg-slate-800/30">
      <div className="hidden md:grid md:grid-cols-3 gap-2 p-3 text-sm font-medium text-blue-300 border-b border-blue-400/20">
        <div className="pl-4">Assets</div>
        <div className="text-center">Current Balance</div>
        <div className="text-center">Quick Actions</div>
      </div>

      <div className="md:divide-y md:divide-blue-400/20">
        {tokenBalances.map(({ token, positionBalance, isLoadingPositionBalance }) => {
          // Skip rendering if token is undefined
          if (!token) return null;
          
          const formatBalance = () => {
            if (isLoadingPositionBalance) return <Spinner size="sm" className="text-green-400" />;
            if (!positionBalance) return "0.00";

            const balance = Number(positionBalance) / Math.pow(10, token.decimals);
            return balance.toFixed(5);
          };

          return (
            <div
              key={token.addresses[defaultChain]}
              className="flex flex-col md:grid md:grid-cols-3 gap-2 p-4 border-b border-blue-400/20 last:border-b-0"
            >
              {/* Assets Column */}
              <div className="flex items-center justify-between md:justify-start gap-3 pl-4">
                <div className="flex items-center gap-3">
                  {token.logo && (
                    <Image
                      src={token.logo}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-white font-medium">${token.symbol}</span>
                </div>
                <span className="text-green-400 font-medium md:hidden">{formatBalance()}</span>
              </div>

              {/* Current Balance Column - Desktop Only */}
              <div className="hidden md:block text-center">
                <span className="text-green-400 font-medium">{formatBalance()}</span>
              </div>

              {/* Quick Actions Column */}
              <div className="flex flex-row items-center justify-center gap-2 mt-2 md:mt-0">
                <Link href="/swap" className="w-1/2 md:w-auto">
                  <Button
                    variant="outline"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-500 text-xs px-2 py-1 md:text-sm md:px-3 md:py-2 h-8 md:h-auto"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Swap
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-1/2 md:w-auto bg-red-600 hover:bg-red-700 text-white border-red-500 text-xs px-2 py-1 md:text-sm md:px-3 md:py-2 h-8 md:h-auto"
                  onClick={() => {
                    setSelectedToken(token);
                    setIsRepayDialogOpen(true);
                  }}
                >
                  Repay
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <RepayDialog
        market={pool}
        selectedToken={selectedToken}
        isOpen={isRepayDialogOpen}
        onClose={() => setIsRepayDialogOpen(false)}
      />
    </div>
  );
};
