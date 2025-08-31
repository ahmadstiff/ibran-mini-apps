"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useGoldskyHistory, Transaction } from "@/hooks/useGoldskyHistory";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import {
  HistoryHeader,
  HistoryFilters,
  HistoryPagination,
  HistoryEmptyState,
  HistoryLoadingState,
  WalletConnectionRequired,
} from "./components";
import { useAccount } from "wagmi";

const HistoryPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [currentPage, setCurrentPage] = useState(1);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const { 
    transactions, 
    loading, 
    error, 
    hasMore, 
    fetchTransactions,
    refreshTransactions 
  } = useGoldskyHistory({ pageSize: 10, autoFetch: isConnected && !!address });

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((tx: Transaction) => {
      const matchesSearch =
        tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.methodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.pool.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
      const matchesType = filterType === "all" || tx.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort transactions
    filtered.sort((a: Transaction, b: Transaction) => {
      switch (sortBy) {
        case "timestamp":
          return parseInt(b.timestamp) - parseInt(a.timestamp);
        case "amount":
          return parseFloat(b.amount) - parseFloat(a.amount);
        case "blockNumber":
          return parseInt(b.blockNumber) - parseInt(a.blockNumber);
        default:
          return parseInt(b.timestamp) - parseInt(a.timestamp);
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterStatus, filterType, sortBy]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredAndSortedTransactions.slice(startIndex, endIndex);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const successful = filteredAndSortedTransactions.filter(
      (tx: Transaction) => tx.status === "success"
    ).length;
    const failed = total - successful;
    const totalValue = filteredAndSortedTransactions.reduce((sum: number, tx: Transaction) => {
      return sum + parseFloat(tx.amount || "0");
    }, 0);

    // Calculate transaction type breakdown
    const typeBreakdown = filteredAndSortedTransactions.reduce(
      (acc: Record<string, number>, tx: Transaction) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : "0",
      totalValue: (totalValue / Math.pow(10, 18)).toFixed(6),
      typeBreakdown,
    };
  }, [filteredAndSortedTransactions]);

  const handleViewDetails = (transaction: Transaction) => {
    // You can implement a modal or navigation to detailed view
  };

  const handleLoadMore = () => {
    if (hasMore) {
      fetchTransactions(currentPage + 1, true);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, sortBy]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show wallet connection required message
  if (!isConnected || !address) {
    return <WalletConnectionRequired />;
  }

  return (
    <div className="min-h-screen mb-40">
      <div className="mx-auto max-w-7xl space-y-8 mt-5">
        {/* Header */}
        <HistoryHeader />

        {/* Filters */}
        <HistoryFilters
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          onRefresh={refreshTransactions}
          loading={loading}
        />

        {/* Transactions List */}
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={refreshTransactions}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : loading && transactions.length === 0 ? (
            <HistoryLoadingState />
          ) : currentTransactions.length === 0 ? (
            <HistoryEmptyState />
          ) : (
            <>
              {currentTransactions.map((tx: Transaction) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}

              {/* Load More Button for Infinite Scroll */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-cyan-800 hover:bg-cyan-800/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}

              {/* Pagination */}
              <HistoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
