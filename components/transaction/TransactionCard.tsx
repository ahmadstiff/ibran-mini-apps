"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CheckCircle,
  Clock,
  Hash,
  Calendar,
  Building,
} from "lucide-react";
import { Transaction } from "@/hooks/useGoldskyHistory";

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const [copied, setCopied] = useState(false);

  const formatValue = (value: string, decimals: number = 18) => {
    const numValue = parseFloat(value) / Math.pow(10, decimals);
    return numValue.toFixed(6);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };



  const getStatusBadge = (status: string) => {
    return status === "success" ? (
      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm shadow-lg">
        Success
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm shadow-lg">
        Failed
      </Badge>
    );
  };

  const getMethodBadge = (type: string) => {
    switch (type) {
      case "supply_liquidity":
        return (
          <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm shadow-lg hidden">
            Supply Liquidity
          </Badge>
        );
      case "withdraw_liquidity":
        return (
          <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm shadow-lg hidden">
            Withdraw Liquidity
          </Badge>
        );
      case "borrow_debt":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30 backdrop-blur-sm shadow-lg hidden">
            Borrow Debt
          </Badge>
        );
      case "repay_collateral":
        return (
          <Badge className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm shadow-lg hidden">
            Repay Collateral
          </Badge>
        );
      case "supply_collateral":
        return (
          <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm shadow-lg hidden">
            Supply Collateral
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30 backdrop-blur-sm shadow-lg hidden">
            Other
          </Badge>
        );
    }
  };

  const openBlockExplorer = (hash: string) => {
    const explorerUrl = `https://sepolia.basescan.org//tx/${hash}`;
    window.open(explorerUrl, "_blank");
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case "supply_liquidity":
        return "Supply Liquidity";
      case "withdraw_liquidity":
        return "Withdraw Liquidity";
      case "borrow_debt":
        return "Borrow Debt";
      case "repay_collateral":
        return "Repay Collateral";
      case "supply_collateral":
        return "Supply Collateral";
      default:
        return "Transaction";
    }
  };

  const getAssetInfo = (asset: string) => {
    // Since we don't have collateral/borrow token info, we'll use a generic approach
    return { symbol: "TOKEN", name: "Token" };
  };

  const assetInfo = getAssetInfo(transaction.asset);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Card className="bg-gray-900 text-gray-100 shadow-xl border border-cyan-800 hover:border-cyan-700 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left Side - Icon and Main Content */}
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            {/* Transaction Icon with Glow Effect */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>

              </div>
            </div>

            {/* Transaction Details */}
            <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
              {/* Header with Enhanced Styling */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2">
                <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent drop-shadow-sm truncate">
                  {getTransactionType(transaction.type)}
                </h3>

              </div>

              {/* Enhanced Transaction Info Grid - Single Column */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300 group">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30 flex-shrink-0">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
                    <div className="text-white text-xs sm:text-sm truncate">
                      {formatTimestamp(transaction.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300 group cursor-pointer">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500/20 to-violet-600/20 rounded-lg flex items-center justify-center border border-violet-500/30 flex-shrink-0 relative">
                    {copied ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    ) : (
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.transactionHash)}
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Hash</div>
                    <div className="text-white font-mono text-xs sm:text-sm truncate">
                      {transaction.transactionHash}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300 group">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Pool</div>
                    <div className="text-white font-mono text-xs sm:text-sm truncate">
                      {transaction.pool.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button with Enhanced Styling */}
          <div className="flex items-center justify-center sm:justify-end flex-shrink-0">
            <Button
              size="sm"
              onClick={() => openBlockExplorer(transaction.transactionHash)}
              className="bg-transparent text-blue-300 border border-cyan-800 hover:border-cyan-500 hover:bg-cyan-800/20 hover:text-blue-200 transition-all duration-300 w-full sm:w-auto"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">View</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
