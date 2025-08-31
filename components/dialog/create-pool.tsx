import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import React from "react";
import { tokens as tokenList } from "@/constants/tokenAddress";
import { chains } from "@/constants/chainAddress";
import Image from "next/image";
import { useCreatePool } from "@/hooks/write/useCreatePool";
import { defaultChain } from "@/lib/get-default-chain";
import { useAccount, useChainId } from "wagmi";
import { toast } from "sonner";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Name } from "@coinbase/onchainkit/identity";

interface CreatePoolDialogProps {
  open: boolean;
  onClose: () => void;
  onPoolCreated?: () => void;
}

// Helper function to get block explorer URL from chain constants
const getBlockExplorerUrl = (chainId: number, txHash: string) => {
  const chain = chains.find((c) => c.id === chainId);
  if (!chain || !chain.contracts.blockExplorer) {
    return `https://scan.test2.btcs.network/tx/${txHash}`; // fallback
  }
  return `${chain.contracts.blockExplorer}/tx/${txHash}`;
};

export const CreatePoolDialog: React.FC<CreatePoolDialogProps> = ({
  open,
  onClose,
  onPoolCreated,
}) => {
  const [formData, setFormData] = React.useState({
    loanToken: "",
    collateralToken: "",
    ltv: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const tokens = tokenList;
  const { address, isConnected } = useAccount();
  const connectedChainId = useChainId();

  const {
    setCollateralToken: setHookCollateralToken,
    setBorrowToken: setHookBorrowToken,
    setLtv: setHookLtv,
    handleCreate,
    isCreating,
    isConfirming,
    isSuccess: hookIsSuccess,
    isError,
    txHash,
    writeError,
    confirmError,
  } = useCreatePool(() => {
    // Show success state without immediately resetting
    setIsSuccess(true);
    // Don't reset form immediately, let user see the success state
    onPoolCreated?.();
  });

  // Store the transaction hash when it's available
  const [storedTxHash, setStoredTxHash] = React.useState<string | undefined>();

  // Update stored transaction hash when txHash changes
  React.useEffect(() => {
    if (txHash) {
      setStoredTxHash(txHash);
    }
  }, [txHash]);

  // Reset error states when dialog opens
  React.useEffect(() => {
    if (open) {
      setError(null);
      setIsSuccess(false);
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ loanToken: "", collateralToken: "", ltv: "" });
    setError(null);
    setIsSuccess(false);
    setStoredTxHash(undefined);
    // Reset hook states by calling the setters
    setHookCollateralToken("");
    setHookBorrowToken("");
    setHookLtv("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSuccess(false);

    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    const borrowTokenData = tokens.find((t) => t.symbol === formData.loanToken);
    const collateralTokenData = tokens.find((t) => t.symbol === formData.collateralToken);

    const borrowTokenAddress = borrowTokenData?.addresses[defaultChain];
    const collateralTokenAddress = collateralTokenData?.addresses[defaultChain];

    try {
      await handleCreate(
        collateralTokenAddress as `0x${string}`,
        borrowTokenAddress as `0x${string}`,
        formData.ltv
      );
    } catch (err: any) {
      toast.error("failed to create pool");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderTokenOption = (token: any) => (
    <div className="flex items-center gap-3">
      <Image
        src={token.logo}
        alt={token.symbol}
        width={24}
        height={24}
        className="rounded-full ring-1 ring-gray-500/30"
      />
      <span className="font-medium">{token.symbol}</span>
    </div>
  );

  const renderStatusMessage = () => {
    // Use stored transaction hash if available, otherwise use current txHash
    const displayTxHash = storedTxHash || txHash;

    if (hookIsSuccess) {
      return (
        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/30 border border-emerald-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-lg shadow-emerald-400/30"></div>
              <span className="text-sm text-emerald-200 font-semibold">
                Pool Created Successfully! ✓
              </span>
            </div>
            {displayTxHash && (
              <a
                href={getBlockExplorerUrl(connectedChainId, displayTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-300 hover:text-emerald-200 underline font-medium transition-colors duration-200 flex items-center gap-1"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="mt-3 text-xs text-emerald-100 bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            Your lending pool has been created and is now available for use.
          </div>
          {displayTxHash && (
            <div className="mt-3 text-xs text-slate-300 font-mono bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-lg px-3 py-2 backdrop-blur-sm">
              {displayTxHash.slice(0, 6)}...{displayTxHash.slice(-4)}
            </div>
          )}
        </div>
      );
    }

    if (isCreating || isConfirming) {
      return (
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-400/30"></div>
              <span className="text-sm text-blue-200 font-semibold">
                {isCreating ? "Creating Pool..." : "Confirming Transaction..."}
              </span>
            </div>
            {displayTxHash && (
              <a
                href={getBlockExplorerUrl(connectedChainId, displayTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-300 hover:text-blue-200 underline font-medium transition-colors duration-200 flex items-center gap-1"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {displayTxHash && (
            <div className="mt-3 text-xs text-slate-300 font-mono bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-lg px-3 py-2 backdrop-blur-sm">
              {displayTxHash.slice(0, 6)}...{displayTxHash.slice(-4)}
            </div>
          )}
        </div>
      );
    }

    if (writeError || confirmError) {
      // Don't show error for user rejection
      const isUserRejection =
        writeError?.message?.includes("User rejected") ||
        confirmError?.message?.includes("User rejected") ||
        writeError?.message?.includes("user rejected") ||
        confirmError?.message?.includes("user rejected");

      if (!isUserRejection) {
        return (
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg shadow-red-400/30"></div>
              <span className="text-sm text-red-200 font-semibold">Transaction Failed</span>
            </div>
            <div className="mt-3 text-xs text-red-100 bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-lg px-3 py-2 backdrop-blur-sm">
              {writeError?.message || confirmError?.message || "Transaction failed"}
            </div>
          </div>
        );
      }
    }

    if (error) {
      return (
        <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-400/30"></div>
            <span className="text-sm text-amber-200 font-semibold">{error}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const isFormValid = formData.loanToken && formData.collateralToken && formData.ltv;
  const canSubmit =
    isConnected && isFormValid && !isCreating && !isConfirming && !hookIsSuccess;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] md:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
              <PlusCircle className="text-blue-400 w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Create New Pool</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 pb-4 pt-2">
          {/* Simple Wallet Connection Check */}
          {!isConnected ? (
            <div className="bg-slate-800/30 border border-slate-600/50 rounded-xl p-6 shadow-xl backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <AlertTriangle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Please connect your wallet to create a new pool
                  </p>
                  <ConnectWallet>
                    <Name className="text-inherit" />
                  </ConnectWallet>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Token Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Borrow Token
                  </label>
                  <Select
                    value={formData.loanToken}
                    onValueChange={(value) => updateFormData("loanToken", value)}
                  >
                    <SelectTrigger className="w-full bg-slate-800/30 border-slate-600/50 hover:border-blue-500/60 text-slate-100 rounded-xl px-4 py-3 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 backdrop-blur-sm">
                      <SelectValue placeholder="Select borrow token" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/30 text-white border border-slate-600/50 rounded-xl shadow-2xl z-[1000] max-h-60 backdrop-blur-xl">
                      {tokens.map((token) => (
                        <SelectItem
                          key={token.symbol}
                          value={token.symbol}
                          className="hover:bg-slate-700/80 focus:bg-slate-500/90 rounded-lg mx-0 my-0.5 transition-colors duration-150"
                        >
                          {renderTokenOption(token)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Collateral Token
                  </label>
                  <Select
                    value={formData.collateralToken}
                    onValueChange={(value) => updateFormData("collateralToken", value)}
                  >
                    <SelectTrigger className="w-full bg-slate-800/30 border-slate-600/50 hover:border-blue-500/60 text-slate-100 rounded-xl px-4 py-3 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 backdrop-blur-sm">
                      <SelectValue
                        placeholder="Select collateral token"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/30 text-white border border-slate-600/50 rounded-xl shadow-2xl z-[1000] max-h-60 backdrop-blur-xl">
                      {tokens.map((token) => (
                        <SelectItem
                          key={token.symbol}
                          value={token.symbol}
                          className="hover:bg-slate-600/90 focus:bg-slate-700/80 rounded-lg mx-1 my-0.5 transition-colors duration-150"
                        >
                          {renderTokenOption(token)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LTV Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  LTV Ratio (%)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  placeholder="80"
                  value={formData.ltv}
                  onChange={(e) => updateFormData("ltv", e.target.value)}
                  className="w-full bg-slate-800/30 border-slate-600/50 hover:border-blue-500/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 text-slate-100 rounded-xl px-4 py-3 transition-all duration-200 placeholder:text-slate-400 backdrop-blur-sm shadow-lg"
                />
              </div>

              {/* Status Messages */}
              {renderStatusMessage()}

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  className="w-full md:w-auto rounded-xl px-6 py-3 transition-all duration-200 border-slate-600/50 text-slate-200 bg-red-700 hover:bg-red-500 hover:text-white hover:border-slate-500/50 backdrop-blur-sm"
                  onClick={handleClose}
                  disabled={isCreating || isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="w-full md:w-auto font-semibold py-3 rounded-xl shadow-xl transition-all duration-200 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white backdrop-blur-sm"
                  onClick={canSubmit ? handleSubmit : undefined}
                  disabled={!canSubmit}
                >
                  {isCreating || isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Pool...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 w-5 h-5" />
                      Create Pool
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
