import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Maximize2, AlertTriangle } from "lucide-react";
import { EnrichedPool } from "@/lib/pair-token-address";
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useWithdrawCollateral } from "@/hooks/write/useWithdrawCollateral";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { useApprove } from "@/hooks/write/useApprove";
import { useBorrow } from "@/hooks/write/useBorrow";
import { useRepay } from "@/hooks/write/useRepayLoan";
import { toast } from "sonner";
import { actionConfig, ActionType } from "@/constants/actionConfig";
import { useActionLogic } from "@/hooks/useActionLogic";
import { TransactionStatus } from "@/components/transaction/TransactionStatus";
import { ChainSelector } from "@/components/chain/ChainSelector";
import { UserCollateralBalanceDisplay } from "@/components/user/UserCollateralBalanceDisplay";
import { UserSupplyBalanceDisplay } from "@/components/user/UserSupplyBalanceDisplay";
import { UserBorrowBalanceDisplay } from "@/components/user/UserBorrowBalanceDisplay";
import { UserCurrentBorrowDisplay } from "@/components/user/UserCurrentBorrowDisplay";
import { UserWalletBalanceDisplay } from "@/components/user/UserWalletBalanceDisplay";
import { useAccount, useChainId } from "wagmi";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { Spinner } from "@/components/ui/spinner";
import { useReadUserSupplyShares } from "@/hooks/read/useUserSupplyShares";
import { useReadTotalSupplyAssets } from "@/hooks/read/useTotalSupplyAssets";
import { useUserWalletBalance } from "@/hooks/read/useUserWalletBalance";
import { useReadUserBorrowShares } from "@/hooks/read/useUserBorrowShares";
import { useReadMaxUserBorrow } from "@/hooks/read/useReadMaxUserBorrow";
import { tokens } from "@/constants/tokenAddress";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Name } from "@coinbase/onchainkit/identity";

interface ActionModalViewProps {
  type: ActionType;
  market: EnrichedPool;
  onAction?: (amount: string, toChainId?: string) => void;
}

export function ActionModalView({ type, market, onAction }: ActionModalViewProps) {
  const {
    amount,
    setAmount,
    toChainId,
    setToChainId,
    isApproved,
    setIsApproved,
    tokenDecimals,
    toChain,
    baseChain,
  } = useActionLogic(type, market);

  const chainId = useChainId();

  // Wallet connection check
  const { isConnected } = useAccount();


  // Reset amount when action type changes
  React.useEffect(() => {
    setAmount("");
    // Reset txHash states when action type changes
    // This will be handled by component re-creation due to key prop in details modal
  }, [type, setAmount]);

  // Get token decimals dynamically - use same logic as useActionLogic
  const tokenDecimalsForHooks = React.useMemo(() => {
    if (type === "supply_collateral" || type === "withdraw_collateral") {
      if (!market?.collateralTokenInfo?.address) return 18;

      const token = tokens.find(
        (t) =>
          t.addresses[chainId]?.toLowerCase() === market.collateralTokenInfo?.address?.toLowerCase()
      );
      return token?.decimals || 18;
    } else if (
      type === "supply_liquidity" ||
      type === "withdraw_liquidity" ||
      type === "borrow" ||
      type === "repay"
    ) {
      if (!market?.borrowTokenInfo?.address) return 18;

      const token = tokens.find(
        (t) =>
          t.addresses[chainId]?.toLowerCase() === market.borrowTokenInfo?.address?.toLowerCase()
      );
      return token?.decimals || 18;
    }
    return 18;
  }, [market, chainId, type]);

  // Get user collateral for max calculation
  const { userCollateralParsed } = useReadUserCollateral(
    market.collateralToken as `0x${string}`,
    market.id as `0x${string}`,
    tokenDecimalsForHooks
  );

  // Get user supply shares for max calculation
  const { userSupplySharesParsed } = useReadUserSupplyShares(
    market.id as `0x${string}`,
    tokenDecimalsForHooks
  );

  // Get total supply assets for borrow max calculation
  const { totalSupplyAssetsParsed } = useReadTotalSupplyAssets(
    market.id as `0x${string}`,
    tokenDecimalsForHooks
  );

  // Get user wallet balance for supply actions
  const {
    userWalletBalanceParsed: collateralWalletBalance,
    walletBalanceLoading: collateralWalletLoading,
  } = useUserWalletBalance(
    (market.collateralTokenInfo?.address || market.collateralToken) as `0x${string}`,
    tokenDecimalsForHooks
  );

  // Get user borrow shares for repay max calculation
  const {
    userBorrowSharesParsed,
    userBorrowSharesLoading,
  } = useReadUserBorrowShares(market.id as `0x${string}`, tokenDecimalsForHooks);

  // Get max user borrow amount for borrow max calculation
  const { maxUserBorrow, isLoadingMaxUserBorrow } = useReadMaxUserBorrow(
    market.id as `0x${string}`,
    tokenDecimalsForHooks
  );

  const {
    userWalletBalanceParsed: borrowWalletBalance,
    userWalletBalanceFormatted: borrowWalletBalanceFormatted,
    walletBalanceLoading: borrowWalletLoading,
  } = useUserWalletBalance(
    (market.borrowTokenInfo?.address || market.borrowToken) as `0x${string}`,
    tokenDecimalsForHooks
  );

  // Initialize hooks
  const {
    setAmount: setApproveAmount,
    handleApprove,
    isApproving,
    isConfirming: isApproveConfirming,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    txHash: approveTxHash,
    writeError: approveWriteError,
    confirmError: approveConfirmError,
  } = useApprove(chainId, tokenDecimals, () => {
    setIsApproved(true);
  });

  // Repay-specific approval hook with correct decimals
  const {
    setAmount: setRepayApproveAmount,
    handleApprove: handleRepayApproveBase,
    isApproving: isRepayApproving,
    isConfirming: isRepayApproveConfirming,

  } = useApprove(chainId, tokenDecimalsForHooks, () => {
    setIsApproved(true);
  });

  // Custom repay approval with 10% buffer
  const handleRepayApprove = async (tokenAddress: `0x${string}`, spenderAddress: `0x${string}`) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Call the base approval function (buffer already applied in amount sync)
      await handleRepayApproveBase(tokenAddress, spenderAddress);
    } catch (error) {
      toast.error("Repay approval failed");
    }
  };

  const {
    setAmount: setSupplyCollateralAmount,
    handleSupplyCollateral,
    isSupplying: isSupplyingCollateral,
    isConfirming: isSupplyCollateralConfirming,
    isSuccess: isSupplyCollateralSuccess,
    isError: isSupplyCollateralError,
    txHash: supplyCollateralTxHash,
    writeError: supplyCollateralWriteError,
    confirmError: supplyCollateralConfirmError,
  } = useSupplyCollateral(chainId, tokenDecimals, () => {
    setAmount("");
    setIsApproved(false);
  });

  const {
    setAmount: setSupplyLiquidityAmount,
    handleSupplyLiquidity,
    isSupplying: isSupplyingLiquidity,
    isConfirming: isSupplyLiquidityConfirming,
    isSuccess: isSupplyLiquiditySuccess,
    isError: isSupplyLiquidityError,
    txHash: supplyLiquidityTxHash,
    writeError: supplyLiquidityWriteError,
    confirmError: supplyLiquidityConfirmError,
  } = useSupplyLiquidity(chainId, tokenDecimals, () => {
    setAmount("");
    setIsApproved(false);
  });

  const {
    setAmount: setBorrowAmount,
    handleBorrow,
    isBorrowing,
    isConfirming: isBorrowConfirming,
    isSuccess: isBorrowSuccess,
    isError: isBorrowError,
    txHash: borrowTxHash,
    writeError: borrowWriteError,
    confirmError: borrowConfirmError,
  } = useBorrow(
    chainId,
    tokenDecimalsForHooks,
    () => {
      setAmount("");
      onAction?.("", undefined);
    },
    toChain?.id,
    market?.id as `0x${string}`
  );

  const {
    setAmount: setWithdrawCollateralAmount,
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawingCollateral,
    isConfirming: isWithdrawCollateralConfirming,
    isSuccess: isWithdrawCollateralSuccess,
    isError: isWithdrawCollateralError,
    txHash: withdrawCollateralTxHash,
    writeError: withdrawCollateralWriteError,
    confirmError: withdrawCollateralConfirmError,
  } = useWithdrawCollateral(chainId, tokenDecimals, () => {
    setAmount("");
  });

  const {
    setShares: setWithdrawLiquidityShares,
    handleWithdrawLiquidity,
    isWithdrawing: isWithdrawingLiquidity,
    isConfirming: isWithdrawLiquidityConfirming,
    isSuccess: isWithdrawLiquiditySuccess,
    isError: isWithdrawLiquidityError,
    txHash: withdrawLiquidityTxHash,
    writeError: withdrawLiquidityWriteError,
    confirmError: withdrawLiquidityConfirmError,
  } = useWithdrawLiquidity(chainId, tokenDecimals, () => {
    setAmount("");
  });

  // Repay hooks - organized and clean
  const {
    repay: handleRepay,
    isPending: isRepaying,
    isLoading: isRepayLoading,
    isSuccess: isRepaySuccess,
  } = useRepay(market.borrowTokenInfo?.name, market.id, false, chainId, tokenDecimalsForHooks);

  // Handle repay success - only for action dialog, not for repay dialog
  React.useEffect(() => {
    if (isRepaySuccess && type === "repay") {
      setAmount("");
      setIsApproved(false);
      // Don't show toast here as repay dialog handles its own success
    }
  }, [isRepaySuccess, setAmount, setIsApproved, type]);

  // Auto-refetch txHash after successful transactions
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      // Reset all txHash after 10 seconds of success
      if (
        isSupplyCollateralSuccess ||
        isSupplyLiquiditySuccess ||
        isWithdrawCollateralSuccess ||
        isWithdrawLiquiditySuccess ||
        isBorrowSuccess ||
        isApproveSuccess ||
        isRepaySuccess
      ) {
        // The hooks will handle their own txHash reset
        // This is just a backup to ensure clean state
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [
    isSupplyCollateralSuccess,
    isSupplyLiquiditySuccess,
    isWithdrawCollateralSuccess,
    isWithdrawLiquiditySuccess,
    isBorrowSuccess,
    isApproveSuccess,
    isRepaySuccess,
  ]);

  React.useEffect(() => {
    if (type === "supply_collateral" && amount) {
      setSupplyCollateralAmount(amount);
      setApproveAmount(amount);
    } else if (type === "supply_liquidity" && amount) {
      setSupplyLiquidityAmount(amount);
      setApproveAmount(amount);
    } else if (type === "withdraw_collateral" && amount) {
      setWithdrawCollateralAmount(amount);
    } else if (type === "withdraw_liquidity" && amount) {
      setWithdrawLiquidityShares(amount);
    } else if (type === "borrow" && amount) {
      setBorrowAmount(amount);
    } else if (type === "repay" && amount) {
      // Add 10% buffer for repay approval
      const approvalAmount = parseFloat(amount) * 1.1;
      setRepayApproveAmount(approvalAmount.toString());
    }
  }, [
    amount,
    type,
    setSupplyCollateralAmount,
    setSupplyLiquidityAmount,
    setWithdrawCollateralAmount,
    setWithdrawLiquidityShares,
    setBorrowAmount,
    setApproveAmount,
    setRepayApproveAmount,
  ]);

  // Calculate max amounts for different actions
  const getMaxAmount = () => {
    switch (type) {
      case "supply_collateral":
        return collateralWalletBalance || 0;
      case "supply_liquidity":
        // Use the same balance that's displayed in UserWalletBalanceDisplay
        // If the parsed balance is 0 but we have a formatted balance, try to parse it
        if (
          borrowWalletBalance === 0 &&
          borrowWalletBalanceFormatted &&
          borrowWalletBalanceFormatted !== "0"
        ) {
          const parsed = parseFloat(borrowWalletBalanceFormatted);
          return isNaN(parsed) ? 0 : parsed;
        }
        return borrowWalletBalance || 0;
      case "withdraw_collateral":
        return userCollateralParsed;
      case "withdraw_liquidity":
        return userSupplySharesParsed;
      case "borrow":
        // Use max user borrow amount from contract if available, otherwise fallback to 70% of total supply assets
        if (!isLoadingMaxUserBorrow && maxUserBorrow !== undefined && maxUserBorrow !== null) {
          // Parse the raw value from contract with proper decimals
          const rawValue = Number(maxUserBorrow);
          const parsedValue = rawValue / Math.pow(10, tokenDecimalsForHooks);
          return parsedValue;
        }
        // Fallback to 70% of total supply assets if max user borrow is not available
        if (totalSupplyAssetsParsed > 0) {
          return totalSupplyAssetsParsed * 0.7; // 70% of total supply assets as fallback
        }
        return 0; // Fallback to 0 if total supply assets is 0
      case "repay":
        return userBorrowSharesParsed || 0;
      default:
        return 0;
    }
  };

  const handleMaxClick = () => {
    const maxAmount = getMaxAmount();

    if (maxAmount > 0) {
      // Format the number to avoid long decimal strings
      const formattedAmount = formatMaxAmount(maxAmount);
      setAmount(formattedAmount);

      // Also update the specific action hooks
      if (type === "supply_collateral") {
        setSupplyCollateralAmount(formattedAmount);
        setApproveAmount(formattedAmount);
      } else if (type === "supply_liquidity") {
        setSupplyLiquidityAmount(formattedAmount);
        setApproveAmount(formattedAmount);
      } else if (type === "withdraw_collateral") {
        setWithdrawCollateralAmount(formattedAmount);
      } else if (type === "withdraw_liquidity") {
        setWithdrawLiquidityShares(formattedAmount);
      } else if (type === "borrow") {
        setBorrowAmount(formattedAmount);
      } else if (type === "repay") {
        // Add 10% buffer for repay approval
        const approvalAmount = parseFloat(formattedAmount) * 1.1;
        setRepayApproveAmount(approvalAmount.toString());
      }
    } else {
      toast.error("No maximum amount available");
    }
  };

  // Helper function to format max amount properly
  const formatMaxAmount = (amount: number): string => {
    if (amount === 0) return "0";

    // For very small numbers, show more decimal places
    if (amount > 0 && amount < 0.000001) {
      return amount.toFixed(12).replace(/\.?0+$/, "");
    }

    // For small numbers, show up to 6 decimal places
    if (amount < 1) {
      return amount.toFixed(6).replace(/\.?0+$/, "");
    }

    // For normal numbers, show 2 decimal places
    if (amount < 1000) {
      return amount.toFixed(2).replace(/\.?0+$/, "");
    }

    // For large numbers, use locale formatting
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const config = actionConfig[type];

  // Handle amount change
  const handleAmountChange = (value: string) => {
    setAmount(value);

    // Handle max button click
    if (value === "max") {
      const maxAmount = getMaxAmount();
      if (maxAmount > 0) {
        const formattedAmount = formatMaxAmount(maxAmount);
        setAmount(formattedAmount);

        // Update all relevant action hooks
        if (type === "supply_collateral") {
          setSupplyCollateralAmount(formattedAmount);
          setApproveAmount(formattedAmount);
        } else if (type === "supply_liquidity") {
          setSupplyLiquidityAmount(formattedAmount);
          setApproveAmount(formattedAmount);
        } else if (type === "withdraw_collateral") {
          setWithdrawCollateralAmount(formattedAmount);
        } else if (type === "withdraw_liquidity") {
          setWithdrawLiquidityShares(formattedAmount);
        } else if (type === "borrow") {
          setBorrowAmount(formattedAmount);
        } else if (type === "repay") {
          // Add 10% buffer for repay approval
          const approvalAmount = parseFloat(formattedAmount) * 1.1;
          setRepayApproveAmount(approvalAmount.toString());
        }
      } else {
        toast.error("No maximum amount available");
      }
      return;
    }

    // Set amounts for different actions
    if (type === "supply_collateral") {
      setApproveAmount(value);
      setSupplyCollateralAmount(value);
    } else if (type === "supply_liquidity") {
      setApproveAmount(value);
      setSupplyLiquidityAmount(value);
    } else if (type === "withdraw_collateral") {
      setWithdrawCollateralAmount(value);
    } else if (type === "withdraw_liquidity") {
      setWithdrawLiquidityShares(value);
    } else if (type === "borrow") {
      setBorrowAmount(value);
    } else if (type === "repay") {
      // Add 10% buffer for repay approval
      const approvalAmount = parseFloat(value) * 1.1;
      setRepayApproveAmount(approvalAmount.toString());
    }
  };

  // Handle action button press
  const handleActionPress = async () => {
    if (type === "supply_collateral" || type === "supply_liquidity") {
      if (!market?.id) {
        toast.error("No lending pool address found");
        return;
      }

      const tokenAddress =
        type === "supply_collateral"
          ? market.collateralTokenInfo?.address
          : market.borrowTokenInfo?.address;

      if (!tokenAddress) {
        toast.error(
          `No ${type === "supply_collateral" ? "collateral" : "borrow"} token address found`
        );
        return;
      }

      try {
        if (!isApproved) {
          const tokenToApprove =
            type === "supply_collateral"
              ? market.collateralTokenInfo?.address
              : market.borrowTokenInfo?.address;

          if (!tokenToApprove) {
            toast.error(
              `No ${type === "supply_collateral" ? "collateral" : "borrow"} token address found`
            );
            return;
          }

          await handleApprove(tokenToApprove as `0x${string}`, market.id as `0x${string}`);
        } else {
          if (type === "supply_collateral") {
            await handleSupplyCollateral(market.id as `0x${string}`);
          } else {
            await handleSupplyLiquidity(market.id as `0x${string}`);
          }
        }
      } catch (error) {
        toast.error(
          `${type === "supply_collateral" ? "Supply collateral" : "Supply liquidity"} failed`
        );
      }
    } else if (type === "withdraw_collateral") {
      if (!market?.id) {
        toast.error("No lending pool address found");
        return;
      }

      try {
        await handleWithdrawCollateral(market.id as `0x${string}`);
      } catch (error) {
        toast.error("Withdraw collateral failed");
      }
    } else if (type === "withdraw_liquidity") {
      if (!market?.id) {
        toast.error("No lending pool address found");
        return;
      }

      try {
        await handleWithdrawLiquidity(market.id as `0x${string}`);
      } catch (error) {
        toast.error("Withdraw liquidity failed");
      }
    } else if (type === "borrow") {
      if (!market?.id) {
        toast.error("No lending pool address found");
        return;
      }

      // Check if user has collateral
      if (userCollateralParsed <= 0) {
        toast.error("You need to supply collateral first before you can borrow", {
          description: "Please supply some collateral tokens to this pool.",
          duration: 5000,
          style: {
            background: "rgba(239, 68, 68, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.1)",
          },
        });
        return;
      }

      // Check if borrow amount exceeds max user borrow amount
      if (!isLoadingMaxUserBorrow && maxUserBorrow !== undefined && maxUserBorrow !== null) {
        const borrowAmount = parseFloat(amount);
        const maxBorrowAmount = Number(maxUserBorrow) / Math.pow(10, tokenDecimalsForHooks);

        if (borrowAmount > maxBorrowAmount) {
          toast.error("Borrow amount exceeds your maximum borrow limit", {
            description: `Maximum borrow amount: ${formatMaxAmount(maxBorrowAmount)}`,
            duration: 5000,
            style: {
              background: "rgba(239, 68, 68, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(239, 68, 68, 0.1)",
            },
          });
          return;
        }
      }

      try {
        await handleBorrow(market.id as `0x${string}`);
      } catch (error) {
        toast.error("Borrow failed");
      }
    } else if (type === "repay") {
      if (!market?.id) {
        toast.error("No lending pool address found");
        return;
      }

      const tokenAddress = market.borrowTokenInfo?.address;

      if (!tokenAddress) {
        toast.error("No borrow token address found");
        return;
      }

      try {
        if (!isApproved) {
          await handleRepayApprove(tokenAddress as `0x${string}`, market.id as `0x${string}`);
        } else {
          await handleRepay(amount);
        }
      } catch (error) {
        toast.error("Repay failed");
      }
    } else {
      onAction?.(amount, undefined);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = () => {
    if (type === "supply_collateral" || type === "supply_liquidity") {
      const isSupplying =
        type === "supply_collateral" ? isSupplyingCollateral : isSupplyingLiquidity;
      const isConfirming =
        type === "supply_collateral" ? isSupplyCollateralConfirming : isSupplyLiquidityConfirming;
      return (
        !amount ||
        parseFloat(amount) <= 0 ||
        isApproving ||
        isSupplying ||
        isApproveConfirming ||
        isConfirming
      );
    } else if (type === "withdraw_collateral") {
      return (
        !amount ||
        parseFloat(amount) <= 0 ||
        isWithdrawingCollateral ||
        isWithdrawCollateralConfirming
      );
    } else if (type === "withdraw_liquidity") {
      return (
        !amount ||
        parseFloat(amount) <= 0 ||
        isWithdrawingLiquidity ||
        isWithdrawLiquidityConfirming
      );
    } else if (type === "borrow") {
      // Check if borrow amount exceeds max borrow
      const borrowAmount = parseFloat(amount);
      const exceedsMaxBorrow =
        !isLoadingMaxUserBorrow &&
        maxUserBorrow !== undefined &&
        maxUserBorrow !== null &&
        borrowAmount > Number(maxUserBorrow) / Math.pow(10, tokenDecimalsForHooks);

      return (
        !amount ||
        parseFloat(amount) <= 0 ||
        isBorrowing ||
        isBorrowConfirming ||
        !toChain ||
        userCollateralParsed <= 0 || // User must have collateral to borrow
        isLoadingMaxUserBorrow || // Disable while loading max borrow data
        exceedsMaxBorrow // Disable if borrow amount exceeds max borrow
      );
    } else if (type === "repay") {
      return (
        !amount ||
        parseFloat(amount) <= 0 ||
        isRepayApproving ||
        isRepaying ||
        isRepayApproveConfirming ||
        isRepayLoading ||
        userBorrowSharesParsed <= 0 // User must have debt to repay
      );
    }
    return !amount || parseFloat(amount) <= 0;
  };

  // Get button text
  const getButtonText = () => {
    if (type === "supply_collateral" || type === "supply_liquidity") {
      if (isApproving || isApproveConfirming) {
        return "Approving...";
      }
      if (isSupplyingCollateral || isSupplyingLiquidity) {
        return "Supplying...";
      }
      if (isSupplyCollateralConfirming || isSupplyLiquidityConfirming) {
        return "Confirming...";
      }
      if (!isApproved) {
        return "Approve";
      }
      return config.buttonText;
    } else if (type === "withdraw_collateral") {
      if (isWithdrawingCollateral) {
        return "Withdrawing...";
      }
      if (isWithdrawCollateralConfirming) {
        return "Confirming...";
      }
      return config.buttonText;
    } else if (type === "withdraw_liquidity") {
      if (isWithdrawingLiquidity) {
        return "Withdrawing...";
      }
      if (isWithdrawLiquidityConfirming) {
        return "Confirming...";
      }
      return config.buttonText;
    } else if (type === "borrow") {
      if (isBorrowing) {
        return "Borrowing...";
      }
      if (isBorrowConfirming) {
        return "Confirming...";
      }
      if (isLoadingMaxUserBorrow) {
        return <Spinner size="sm" className="text-gray-400" />;
      }
      if (userCollateralParsed <= 0) {
        return "No Collateral";
      }

      // Check if borrow amount exceeds max borrow
      const borrowAmount = parseFloat(amount);
      const exceedsMaxBorrow =
        !isLoadingMaxUserBorrow &&
        maxUserBorrow !== undefined &&
        maxUserBorrow !== null &&
        borrowAmount > Number(maxUserBorrow) / Math.pow(10, tokenDecimalsForHooks);

      if (exceedsMaxBorrow) {
        return "Exceeds Limit";
      }

      return config.buttonText;
    } else if (type === "repay") {
      if (isRepayApproving || isRepayApproveConfirming) {
        return "Approving...";
      }
      if (isRepaying || isRepayLoading) {
        return "Repaying...";
      }
      if (userBorrowSharesParsed <= 0) {
        return "No Debt";
      }
      if (!isApproved) {
        return "Approve";
      }
      return config.buttonText;
    }
    return config.buttonText;
  };

  // Get button color
  const getButtonColor = () => {
    if (type === "supply_collateral" || type === "supply_liquidity") {
      if (!isApproved) {
        return "default";
      }
      return config.buttonColor === "primary" ? "default" : "secondary";
    }
    return config.buttonColor === "primary" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Simple Wallet Connection Check */}
      {!isConnected ? (
                <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-6 shadow-xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <AlertTriangle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-slate-400 mb-4">
                Please connect your wallet to interact with this pool
              </p>
              <ConnectWallet>
                <Name className="text-inherit" />
              </ConnectWallet>
            </div>
          </div>
        </div>
              ) : (
        <>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">{config.balanceLabel}</span>
            {/* Use real balance data for different actions */}
            {type === "supply_collateral" ? (
              <UserWalletBalanceDisplay market={market} actionType={type} />
            ) : type === "supply_liquidity" ? (
              <UserWalletBalanceDisplay market={market} actionType={type} />
            ) : type === "withdraw_collateral" ? (
              <UserCollateralBalanceDisplay market={market} />
            ) : type === "withdraw_liquidity" ? (
              <UserSupplyBalanceDisplay market={market} />
            ) : type === "borrow" ? (
              <UserBorrowBalanceDisplay market={market} />
            ) : type === "repay" ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {borrowWalletBalanceFormatted || "0"}
                </span>
                              <span className="text-slate-400">
                {market.borrowTokenInfo?.symbol || market.borrowToken}
              </span>
              </div>
            ) : (
              <span className="font-semibold text-white">{config.balanceValue(market)}</span>
            )}
          </div>

          {/* Show supplied amount for supply actions */}
          {type === "supply_collateral" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Your Supplied Collateral</span>
              <UserCollateralBalanceDisplay market={market} />
            </div>
          )}

          {type === "supply_liquidity" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Your Supplied Liquidity</span>
              <UserSupplyBalanceDisplay market={market} />
            </div>
          )}

          {/* Show current borrow for borrow action */}
          {type === "borrow" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Your Borrow</span>
              <UserCurrentBorrowDisplay market={market} />
            </div>
          )}

          {/* Show current debt for repay action */}
          {type === "repay" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Your Borrow Debt</span>
              <UserCurrentBorrowDisplay market={market} />
            </div>
          )}

          {/* Show collateral warning for borrow action */}
          {type === "borrow" && userCollateralParsed <= 0 && (
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-400/30"></div>
                <span className="text-sm text-amber-200 font-semibold">
                  No Collateral Available
                </span>
              </div>
              <div className="mt-2 text-xs text-amber-100">
                You need to supply collateral first before you can borrow.
              </div>
            </div>
          )}

          {config.showApy && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">{config.apyLabel}</span>
              <span className={`font-semibold ${config.apyColor}`}>
                {config.apyValue ? config.apyValue(market) : "N/A"}
              </span>
            </div>
          )}
          {type === "borrow" && (
            <ChainSelector
              fromChain={baseChain}
              toChainId={toChainId}
              setToChainId={setToChainId}
              isBorrowMode={true}
            />
          )}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200">{config.inputLabel}</label>
            <div className="relative">
              <Input
                placeholder={type === "repay" ? "Enter amount to repay..." : "0.0"}
                className={`w-full bg-slate-800/80 border transition-all duration-200 mt-2 rounded-xl px-4 py-3 pr-24 backdrop-blur-sm ${
                  type === "repay"
                    ? "border-blue-600/50 hover:border-blue-400/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                    : "border-slate-600/50 hover:border-blue-400/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                } text-slate-100 placeholder:text-slate-400`}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <span
                  className={`text-sm font-medium ${
                    type === "repay" ? "text-blue-300" : "text-slate-300"
                  }`}
                >
                  {config.tokenSymbol(market)}
                </span>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={
                    type === "supply_liquidity"
                      ? borrowWalletLoading
                      : type === "supply_collateral"
                        ? collateralWalletLoading
                        : type === "repay"
                          ? userBorrowSharesLoading
                          : false
                  }
                  className={`transition-colors flex items-center space-x-1 ${
                    (type === "supply_liquidity" && borrowWalletLoading) ||
                    (type === "supply_collateral" && collateralWalletLoading) ||
                    (type === "repay" && userBorrowSharesLoading)
                      ? "text-slate-500 cursor-not-allowed"
                      : type === "repay"
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-400 hover:text-blue-300"
                  }`}
                  title="Set to maximum available amount"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-xs font-medium">MAX</span>
                </button>
              </div>
            </div>

            {/* Repay-specific info */}
            {type === "repay" && amount && parseFloat(amount) > 0 && (
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/40 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300">Repay Amount:</span>
                  <span className="text-slate-100 font-medium">
                    {amount} {market.borrowTokenInfo?.symbol || market.borrowToken}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-400">Approval Amount (with 10% buffer):</span>
                  <span className="text-slate-100 font-medium">
                    {(parseFloat(amount) * 1.1).toFixed(6)}{" "}
                    {market.borrowTokenInfo?.symbol || market.borrowToken}
                  </span>
                </div>
                {userBorrowSharesParsed > 0 && (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-red-300">Remaining Debt:</span>
                    <span className="text-slate-100 font-medium">
                      {Math.max(0, userBorrowSharesParsed - parseFloat(amount)).toFixed(6)}{" "}
                      {market.borrowTokenInfo?.symbol || market.borrowToken}
                    </span>
                  </div>
                )}
                {userBorrowSharesParsed > 0 && parseFloat(amount) > userBorrowSharesParsed && (
                  <div className="mt-2 p-2 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/40 rounded-lg text-xs text-amber-200">
                    ⚠️ You're repaying more than your debt. Excess will be refunded.
                  </div>
                )}
              </div>
            )}

            {/* Repay loading state */}
            {type === "repay" && userBorrowSharesLoading && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/40 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Spinner size="sm" className="text-slate-400" />
                  <span>Loading debt information...</span>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleActionPress}
            disabled={isButtonDisabled()}
            variant={getButtonColor()}
            className={`${config.buttonClass} ${
              type === "repay"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:ring-blue-500/30"
                : ""
            }`}
          >
            {React.createElement(config.buttonIcon, {
              className: "mr-2 w-5 h-5",
            })}
            {getButtonText()}
          </Button>

          {/* Transaction Status Section */}
          {(type === "supply_collateral" ||
            type === "supply_liquidity" ||
            type === "withdraw_collateral" ||
            type === "withdraw_liquidity" ||
            type === "borrow" ||
            type === "repay") && (
            <div className="space-y-4">
              {/* Approval Transaction Status */}
              {(type === "supply_collateral" || type === "supply_liquidity") && approveTxHash && (
                <TransactionStatus
                  type="approve"
                  txHash={approveTxHash}
                  chainId={chainId}
                  isConfirming={isApproveConfirming}
                  isSuccess={isApproveSuccess}
                  isError={isApproveError}
                  errorMessage={approveWriteError?.message || approveConfirmError?.message}
                />
              )}

              {/* Supply Transaction Status */}
              {(type === "supply_collateral" || type === "supply_liquidity") &&
                (supplyCollateralTxHash || supplyLiquidityTxHash) && (
                  <TransactionStatus
                    type="supply"
                    txHash={supplyCollateralTxHash || supplyLiquidityTxHash}
                    chainId={chainId}
                    isConfirming={isSupplyCollateralConfirming || isSupplyLiquidityConfirming}
                    isSuccess={isSupplyCollateralSuccess || isSupplyLiquiditySuccess}
                    isError={isSupplyCollateralError || isSupplyLiquidityError}
                    errorMessage={
                      supplyCollateralWriteError?.message ||
                      supplyCollateralConfirmError?.message ||
                      supplyLiquidityWriteError?.message ||
                      supplyLiquidityConfirmError?.message
                    }
                  />
                )}

              {/* Withdraw Collateral Transaction Status */}
              {type === "withdraw_collateral" && withdrawCollateralTxHash && (
                <TransactionStatus
                  type="withdraw"
                  txHash={withdrawCollateralTxHash}
                  chainId={chainId}
                  isConfirming={isWithdrawCollateralConfirming}
                  isSuccess={isWithdrawCollateralSuccess}
                  isError={isWithdrawCollateralError}
                  errorMessage={
                    withdrawCollateralWriteError?.message || withdrawCollateralConfirmError?.message
                  }
                />
              )}

              {/* Withdraw Liquidity Transaction Status */}
              {type === "withdraw_liquidity" && withdrawLiquidityTxHash && (
                <TransactionStatus
                  type="withdraw"
                  txHash={withdrawLiquidityTxHash}
                  chainId={chainId}
                  isConfirming={isWithdrawLiquidityConfirming}
                  isSuccess={isWithdrawLiquiditySuccess}
                  isError={isWithdrawLiquidityError}
                  errorMessage={
                    withdrawLiquidityWriteError?.message || withdrawLiquidityConfirmError?.message
                  }
                />
              )}

              {/* Borrow Transaction Status */}
              {type === "borrow" && borrowTxHash && (
                <TransactionStatus
                  type="borrow"
                  txHash={borrowTxHash}
                  chainId={chainId}
                  isConfirming={isBorrowConfirming}
                  isSuccess={isBorrowSuccess}
                  isError={isBorrowError}
                  errorMessage={borrowWriteError?.message || borrowConfirmError?.message}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
