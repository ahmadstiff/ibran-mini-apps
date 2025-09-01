import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpCircle, AlertTriangle, ArrowDownUp, ArrowDownCircle } from "lucide-react";
import { EnrichedPool } from "@/lib/pair-token-address";
import { useRepay } from "@/hooks/write/useRepaySelectedToken";
import { toast } from "sonner";
import { useActionLogic } from "@/hooks/useActionLogic";
import { TransactionStatus } from "@/components/transaction/TransactionStatus";
import { UserBorrowBalanceDisplay } from "@/components/user/UserBorrowBalanceDisplay";
import { UserWalletBalanceDisplay } from "@/components/user/UserWalletBalanceDisplay";
import { useAccount, useChainId } from "wagmi";
import { Spinner } from "@/components/ui/spinner";
import { tokens } from "@/constants/tokenAddress";
import { defaultChain } from "@/lib/get-default-chain";
import { useTokenCalculator } from "@/hooks/read/useTokenCalculator";
import { useReadAddressPosition } from "@/hooks/read/useReadPositionAddress";
import { Address } from "viem";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Name } from "@coinbase/onchainkit/identity";

interface RepayDialogProps {
  market: EnrichedPool;
  selectedToken: any;
  isOpen: boolean;
  onClose: () => void;
}

export function RepayDialog({ market, selectedToken, isOpen, onClose }: RepayDialogProps) {
  // Early return if market is not provided
  if (!market) {
    return null;
  }

  const { amount, setAmount, tokenDecimals, baseChain } = useActionLogic("repay", market);

  const chainId = useChainId();

  // Wallet connection check
  const { address, isConnected } = useAccount();
  const connectedChainId = useChainId();


  // Get position address
  const { addressPosition } = useReadAddressPosition(market.id);

  // State for dual input
  const [inputTokenAmount, setInputTokenAmount] = React.useState("");
  const [borrowTokenAmount, setBorrowTokenAmount] = React.useState("");
  const [lastInputChanged, setLastInputChanged] = React.useState<"input" | "borrow">("input");

  // Reset amounts when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setInputTokenAmount("");
      setBorrowTokenAmount("");
      setAmount("");
      setLastInputChanged("input");
    }
  }, [isOpen, setAmount]);

  // Get token decimals dynamically
  const tokenDecimalsForHooks = React.useMemo(() => {
    // Try to get from borrowTokenInfo first
    if (market?.borrowTokenInfo?.address) {
      const token = tokens.find(
        (t) =>
          t.addresses[chainId]?.toLowerCase() === market.borrowTokenInfo?.address?.toLowerCase()
      );
      return token?.decimals || 18;
    }

    // Fallback to borrowToken string
    if (market?.borrowToken) {
      const token = tokens.find(
        (t) => t.addresses[chainId]?.toLowerCase() === market.borrowToken?.toLowerCase()
      );
      return token?.decimals || 18;
    }

    return 18;
  }, [market?.borrowTokenInfo?.address, market?.borrowToken, chainId]);

  // Get selected token info (dynamic input token)
  const inputToken = React.useMemo(() => {
    return selectedToken;
  }, [selectedToken]);

  // Get borrow token info
  const borrowToken = React.useMemo(() => {
    if (market?.borrowTokenInfo) {
      return tokens.find(
        (t) =>
          t.addresses[chainId]?.toLowerCase() === market.borrowTokenInfo?.address?.toLowerCase()
      );
    }
    if (market?.borrowToken) {
      return tokens.find(
        (t) => t.addresses[chainId]?.toLowerCase() === market.borrowToken?.toLowerCase()
      );
    }
    return null;
  }, [market, chainId]);

  // Token calculator for input token to borrow token conversion
  const {
    price: inputToBorrowRate,
    isLoading: isLoadingInputToBorrow,
    error: errorInputToBorrow,
  } = useTokenCalculator(
    inputToken?.addresses[defaultChain] as Address,
    borrowToken?.addresses[defaultChain] as Address,
    Number(inputTokenAmount) || 0,
    addressPosition as Address
  );

  // Token calculator for borrow token to input token conversion
  const {
    price: borrowToInputRate,
    isLoading: isLoadingBorrowToInput,
    error: errorBorrowToInput,
  } = useTokenCalculator(
    borrowToken?.addresses[defaultChain] as Address,
    inputToken?.addresses[defaultChain] as Address,
    Number(borrowTokenAmount) || 0,
    addressPosition as Address
  );

  // Token calculator for rate calculation (1 unit)
  const {
    price: baseRate,
    isLoading: isLoadingBaseRate,
    error: errorBaseRate,
  } = useTokenCalculator(
    inputToken?.addresses[defaultChain] as Address,
    borrowToken?.addresses[defaultChain] as Address,
    1,
    addressPosition as Address
  );

  // Repay hooks
  const {
    repay: handleRepay,
    isPending: isRepaying,
    isLoading: isRepayLoading,
    isSuccess: isRepaySuccess,
    isError: isRepayError,
    error: repayError,
    reset: resetRepay,
    userBorrowShares,
    totalBorrowAssets,
    totalBorrowShares,
    userBorrowSharesLoading,
    totalBorrowAssetsLoading,
    isLoadingTotalBorrowShares,
  } = useRepay(
    market.borrowTokenInfo?.name || market.borrowToken,
    market.id,
    false,
    chainId,
    market.borrowTokenInfo?.decimals || 6, // Use borrow token decimals
    inputToken?.name // Pass selected token name instead of address
  );

  const { refetchAll } = useRepay(
    market.borrowTokenInfo?.name || market.borrowToken,
    market.id,
    false,
    chainId,
    market.borrowTokenInfo?.decimals || 6,
    inputToken?.name
  );

  // Handle repay success
  React.useEffect(() => {
    if (isRepaySuccess) {
      console.log("🎉 [REPAY DIALOG] Repay successful, closing dialog");
      
      setInputTokenAmount("");
      setBorrowTokenAmount("");
      setAmount("");
      toast.success("Repay successful!");

      // Refetch data after successful transaction
      if (refetchAll) {
        refetchAll();
      }

      // Reset the repay hook state to prevent showing success again
      resetRepay();
      
      // Close the dialog
      onClose();
    }
  }, [isRepaySuccess, setAmount, onClose, refetchAll, resetRepay]);

  // Handle repay error
  React.useEffect(() => {
    if (isRepayError && repayError) {
      toast.error("Repay failed");
    }
  }, [isRepayError, repayError]);

  // Reset repay hook state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      resetRepay();
    }
  }, [isOpen, resetRepay]);

  // Calculate max amount (user's borrow shares)
  const getMaxAmount = () => {
    if (userBorrowSharesLoading || !userBorrowShares) return 0;
    return Number(userBorrowShares) / Math.pow(10, tokenDecimalsForHooks);
  };

  const handleMaxClick = () => {
    const maxAmount = getMaxAmount();
    if (maxAmount > 0) {
      setLastInputChanged("borrow");
      setBorrowTokenAmount(maxAmount.toString());
    }
  };

  const formatMaxAmount = (amount: number): string => {
    if (amount === 0) return "0.00";
    return amount.toFixed(5);
  };

  const handleInputTokenAmountChange = (value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      setLastInputChanged("input");
      setInputTokenAmount(value);

      // Calculate conversion from input token to borrow token for display
      if (value && Number(value) > 0) {
        // Use base rate for conversion to borrow token (for display only)
        if (baseRate > 0) {
          const convertedAmount = Number(value) * baseRate;
          setBorrowTokenAmount(convertedAmount.toFixed(6));
          // Set amount as the input token amount (not converted)
          setAmount(value);
        } else if (inputToBorrowRate > 0) {
          // Fallback to direct calculation
          const convertedAmount = Number(value) * inputToBorrowRate;
          setBorrowTokenAmount(convertedAmount.toFixed(6));
          // Set amount as the input token amount (not converted)
          setAmount(value);
        }
      } else if (!value) {
        setBorrowTokenAmount("");
        setAmount("");
      }
    }
  };

  const handleBorrowTokenAmountChange = (value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      setLastInputChanged("borrow");
      setBorrowTokenAmount(value);

      // Calculate conversion from borrow token to input token for display
      if (value && Number(value) > 0) {
        // Use base rate for conversion to input token (for display only)
        if (baseRate > 0) {
          const convertedAmount = Number(value) / baseRate;
          setInputTokenAmount(convertedAmount.toFixed(6));
          // Set amount as the borrow token amount (not converted)
          setAmount(value);
        } else if (borrowToInputRate > 0) {
          // Fallback to direct calculation
          const convertedAmount = Number(value) * borrowToInputRate;
          setInputTokenAmount(convertedAmount.toFixed(6));
          // Set amount as the borrow token amount (not converted)
          setAmount(value);
        }
      } else if (!value) {
        setInputTokenAmount("");
        setAmount("");
      }
    }
  };

  const handleRepayPress = async () => {
    // Always use borrow token amount for repayment
    const finalAmount = borrowTokenAmount;

    if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }



    try {
      await handleRepay(finalAmount, {
        totalAssets: totalBorrowAssets?.toString(),
        totalShares: totalBorrowShares?.toString(),
      });
    } catch (error) {
      toast.error("Repay failed. Please try again.");
    }
  };

  const isButtonDisabled = () => {
    return (
      !isConnected ||
      !borrowTokenAmount ||
      isNaN(Number(borrowTokenAmount)) ||
      Number(borrowTokenAmount) <= 0 ||
      isRepaying ||
      isRepayLoading ||
      userBorrowSharesLoading ||
      totalBorrowAssetsLoading ||
      isLoadingTotalBorrowShares
    );
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isRepaying || isRepayLoading) return "Repaying...";
    if (!borrowTokenAmount || isNaN(Number(borrowTokenAmount)) || Number(borrowTokenAmount) <= 0)
      return "Enter Amount";
    return "Repay";
  };

  const getExchangeRate = () => {
    if (baseRate > 0) {
      return `1 ${inputToken?.symbol} = ${baseRate.toFixed(6)} ${borrowToken?.symbol}`;
    }
    return "Calculating exchange rate...";
  };

  const getDynamicExchangeRate = () => {
    if (inputTokenAmount && Number(inputTokenAmount) > 0 && baseRate > 0) {
      const convertedAmount = Number(inputTokenAmount) * baseRate;
      return `${inputTokenAmount} ${inputToken?.symbol} = ${convertedAmount.toFixed(6)} ${borrowToken?.symbol}`;
    }
    if (borrowTokenAmount && Number(borrowTokenAmount) > 0 && baseRate > 0) {
      const convertedAmount = Number(borrowTokenAmount) / baseRate;
      return `${borrowTokenAmount} ${borrowToken?.symbol} = ${convertedAmount.toFixed(6)} ${inputToken?.symbol}`;
    }
    return getExchangeRate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 md:p-6 w-full max-w-2xl mx-4 border border-slate-700/50 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
            </div>
            Repay Debt
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg p-2 transition-all duration-200"
          >
            ✕
          </Button>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
              <ConnectWallet>
                <Name className="text-inherit" />
              </ConnectWallet>
          </div>
        ) : (
          <>
            {/* Market Info */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Pool</span>
                <span className="text-slate-100 font-medium">
                  {market.collateralTokenInfo?.symbol}/{market.borrowTokenInfo?.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Network</span>
                <span className="text-blue-400 text-sm">{baseChain?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Your Balance</span>
                <span className="text-slate-100 font-medium">
              <UserWalletBalanceDisplay market={market} actionType="supply_liquidity" />
              </span>
              </div>
            </div>

            {/* Exchange Rate Display */}
            <div className="mb-4 p-3 xl:p-2 bg-slate-800/30 border border-slate-600/50 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="text-sm text-slate-400 pb-2">Exchange rate</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-100">
                  <span className="text-sm">{getDynamicExchangeRate()}</span>
                  {(isLoadingInputToBorrow || isLoadingBorrowToInput || isLoadingBaseRate) && (
                    <Spinner size="sm" className="text-blue-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Dual Input Section */}
            <div className="mb-6 space-y-4">
              {/* Input Token */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Amount in {inputToken?.symbol} (Input)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={inputTokenAmount}
                    onChange={(e) => handleInputTokenAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-800/30 border-slate-600/50 hover:border-blue-500/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 text-slate-100 placeholder:text-slate-400 backdrop-blur-sm shadow-lg"
                    disabled={isRepaying || isRepayLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 font-medium">
                    {inputToken?.symbol}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Enter {inputToken?.symbol} amount to see equivalent {borrowToken?.symbol}
                </div>
              </div>

              {/* Conversion Arrow */}
              <div className="flex justify-center">
                <div className="bg-transparent rounded-full flex items-center justify-center shadow-lg">
                  <ArrowDownCircle className="w-8 h-8 text-blue-900" />
                </div>
              </div>

              {/* Borrow Token Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Amount in {borrowToken?.symbol} (Repay Amount)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={borrowTokenAmount}
                    onChange={(e) => handleBorrowTokenAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-800/30 border-slate-600/50 hover:border-blue-500/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 text-slate-100 placeholder:text-slate-400 backdrop-blur-sm shadow-lg pr-16"
                    disabled={isRepaying || isRepayLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={
                      userBorrowSharesLoading || getMaxAmount() <= 0 || isRepaying || isRepayLoading
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500/50 rounded-lg transition-all duration-200"
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Max: {formatMaxAmount(getMaxAmount())}</span>
                  <span>{borrowToken?.symbol}</span>
                </div>
                <div className="text-xs text-green-400 mt-1">
                  This amount will be converted to borrow shares for repayment
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {(isRepaying || isRepayLoading) && (
              <div className="mb-4">
                <TransactionStatus
                  type="withdraw"
                  chainId={chainId}
                  isConfirming={isRepaying || isRepayLoading}
                  isSuccess={isRepaySuccess}
                  isError={isRepayError}
                  errorMessage={repayError?.message}
                />
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleRepayPress}
              disabled={isButtonDisabled()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-xl transition-all duration-200 backdrop-blur-sm"
            >
              {isRepaying || isRepayLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 mr-2" />
              )}
              {getButtonText()}
            </Button>

            {/* Error Display */}
            {repayError && (
              <div className="mt-4 p-4 bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-500/50 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{repayError.message}</span>
                </div>
              </div>
            )}

            {/* Token Calculator Errors */}
            {(errorInputToBorrow || errorBorrowToInput || errorBaseRate) && (
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-500/50 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    {errorInputToBorrow?.message ||
                      errorBorrowToInput?.message ||
                      errorBaseRate?.message ||
                      "Token calculator error"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
