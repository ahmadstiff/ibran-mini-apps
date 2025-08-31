"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { mockErc20Abi } from "@/lib/abis/mockErc20Abi";
import { tokens } from "@/constants/tokenAddress";
import { Token } from "@/types";
import { addTokenToWallet } from "@/lib/walletUtils";
import { defaultChain } from "@/lib/get-default-chain";

export const useFaucet = (chainId: number = defaultChain) => {
  const { address } = useAccount();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync, error: writeError, isPending: isWritePending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const filteredTokens = tokens
    .map((token) => {
      const tokenAddress = token.addresses[chainId];
      return tokenAddress ? { ...token, address: tokenAddress } : null;
    })
    .filter((token): token is Token & { address: `0x${string}` } => token !== null);

  // Console log untuk debugging wallet connection
  useEffect(() => {
    console.log("🔗 [FAUCET] Wallet Status:", {
      address: address || "Not connected",
      chainId,
      defaultChain,
      isConnected: !!address
    });
  }, [address, chainId]);

  // Console log untuk debugging token selection
  useEffect(() => {
    console.log("🪙 [FAUCET] Token Selection:", {
      selectedTokenAddress,
      amount,
      filteredTokensCount: filteredTokens.length,
      availableTokens: filteredTokens.map(t => ({ symbol: t.symbol, address: t.address }))
    });
  }, [selectedTokenAddress, amount, filteredTokens]);

  // Enhanced setAmount with debugging
  const setAmountWithDebug = (newAmount: string) => {
    console.log("💰 [FAUCET] Amount Changed:", {
      oldAmount: amount,
      newAmount,
      isValid: !isNaN(parseFloat(newAmount))
    });
    setAmount(newAmount);
  };

  const handleClaim = async () => {
    console.log("🚀 [FAUCET] Claim Attempt Started:", {
      timestamp: new Date().toISOString(),
      address,
      selectedTokenAddress,
      amount,
      chainId
    });

    if (!selectedTokenAddress || !amount) {
      console.warn("⚠️ [FAUCET] Validation Failed:", {
        hasToken: !!selectedTokenAddress,
        hasAmount: !!amount
      });
      toast.error("Please select a token and enter an amount", {
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

    if (!address) {
      console.warn("⚠️ [FAUCET] Wallet Not Connected");
      toast.error("Please connect your wallet", {
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

    const selectedToken = filteredTokens.find((token) => token.address === selectedTokenAddress);

    if (!selectedToken) {
      toast.error("Invalid token selected", {
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

    try {
      console.log("✅ [FAUCET] Starting Claim Process:", {
        token: selectedToken.symbol,
        amount,
        userAddress: address
      });

      setIsClaiming(true);
      setTxHash(undefined);

      const decimals = selectedToken.decimals;
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** decimals));

      console.log("🔢 [FAUCET] Amount Conversion:", {
        originalAmount: amount,
        decimals,
        amountBigInt: amountBigInt.toString()
      });

      const tx = await writeContractAsync({
        address: selectedTokenAddress as `0x${string}`,
        abi: mockErc20Abi,
        functionName: "mintMock",
        args: [address as `0x${string}`, amountBigInt],
      });

      if (tx) {
        console.log("📝 [FAUCET] Transaction Submitted:", {
          txHash: tx,
          token: selectedToken.symbol,
          amount: amount,
          userAddress: address,
          timestamp: new Date().toISOString()
        });

        setTxHash(tx);
        toast.success("Transaction submitted. Waiting for confirmation...", {
          style: {
            background: "rgba(59, 130, 246, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#93c5fd",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(59, 130, 246, 0.1)",
          },
        });
      }
    } catch (error: any) {
      console.error("💥 [FAUCET] Claim Error:", {
        error: error.message,
        code: error.code,
        token: selectedToken?.symbol,
        amount,
        userAddress: address,
        timestamp: new Date().toISOString()
      });

      // Don't show error for user rejection (code 4001)
      if (error.code !== 4001) {
        toast.error("Failed to submit transaction", {
          style: {
            background: "rgba(239, 68, 68, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.1)",
          },
        });
      } else {
        console.log("👤 [FAUCET] User Rejected Transaction");
      }
      setIsClaiming(false);
    }
  };

  const copyTokenAddress = () => {
    if (selectedTokenAddress) {
      console.log("📋 [FAUCET] Token Address Copied:", {
        tokenAddress: selectedTokenAddress,
        timestamp: new Date().toISOString()
      });
      navigator.clipboard.writeText(selectedTokenAddress);
      toast.success("Token address copied to clipboard", {
        style: {
          background: "rgba(34, 197, 94, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#86efac",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.1)",
        },
      });
    }
  };

  const handleAddTokenToWallet = async () => {
    const selectedToken = filteredTokens.find((token) => token.address === selectedTokenAddress);

    if (selectedToken) {
      console.log("➕ [FAUCET] Adding Token to Wallet:", {
        token: {
          symbol: selectedToken.symbol,
          address: selectedToken.address,
          decimals: selectedToken.decimals
        },
        timestamp: new Date().toISOString()
      });
      await addTokenToWallet(selectedTokenAddress, selectedToken);
    }
  };

  // Debug effect to track amount changes
  useEffect(() => {}, [amount]);

  // Debug effect to track claiming state
  useEffect(() => {}, [isClaiming, isWritePending]);

  useEffect(() => {
    if (isSuccess && txHash) {
      console.log("🎉 [FAUCET] Claim Success:", {
        txHash,
        token: filteredTokens.find(t => t.address === selectedTokenAddress)?.symbol,
        amount,
        userAddress: address,
        timestamp: new Date().toISOString()
      });

      toast.success(`Successfully claimed tokens!`, {
        style: {
          background: "rgba(34, 197, 94, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#86efac",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.1)",
        },
      });
      setAmount("");
      setSelectedTokenAddress("");
      setIsClaiming(false);
    }
  }, [isSuccess, txHash, filteredTokens, selectedTokenAddress, amount, address]);

    useEffect(() => {
    if (isError) {
      console.error("❌ [FAUCET] Transaction Error:", {
        txHash,
        confirmError: confirmError?.message,
        writeError: writeError?.message,
        isUserRejection: (confirmError as any)?.code === 4001 || (writeError as any)?.code === 4001,
        timestamp: new Date().toISOString()
      });

      // Don't show error for user rejection (code 4001)
      const isUserRejection =
        (confirmError as any)?.code === 4001 || (writeError as any)?.code === 4001;

      if (!isUserRejection) {
        const errorMessage = confirmError?.message || writeError?.message || "Transaction failed";
        toast.error(`Transaction failed: ${errorMessage}`, {
          style: {
            background: "rgba(239, 68, 68, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(239, 68, 68, 0.1)",
        },
        });
      }
      setIsClaiming(false);
    }
  }, [isError, confirmError, writeError, txHash]);

  // Reset claiming state if it gets stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isClaiming && !isWritePending && !isConfirming) {
        setIsClaiming(false);
      }
    }, 30000); // Reset after 30 seconds if stuck

    return () => clearTimeout(timeout);
  }, [isClaiming, isWritePending, isConfirming]);

  return {
    selectedTokenAddress,
    amount,
    isClaiming: isClaiming || isWritePending,
    isConfirming,
    txHash,
    filteredTokens,
    setSelectedTokenAddress,
    setAmount: setAmountWithDebug, // Use the debug version
    handleClaim,
    copyTokenAddress,
    addTokenToWallet: handleAddTokenToWallet,
    isSuccess,
    isError,
    error: confirmError || writeError,
  };
};
