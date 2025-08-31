"use client";
import { useState, useEffect } from "react";
import { fetchLendingPools } from "@/lib/graphql/lendingpool-list.fetch";
import  enrichPoolWithTokenInfo  from "@/lib/pair-token-address";
import { defaultChain } from "@/lib/get-default-chain";

export interface Pool {
  id: string;
  collateralToken: string;
  borrowToken: string;
  ltv: string;
  createdAt: string;
  blockNumber: string;
  transactionHash: string;
  borrowTokenInfo?: any;
  collateralTokenInfo?: any;
}

export const useGoldskyLendingPools = (chainId?: number) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        setError(null);

        const defaultChainId = chainId || defaultChain;
        const items = await fetchLendingPools();

        // Map GraphQL records to the shape expected by enrichPoolWithTokenInfo
        const mapped = items.map((pool) => ({
          id: pool.id, // use pool id directly
          collateralToken: pool.collateralToken,
          borrowToken: pool.borrowToken,
          ltv: pool.ltv,
        }));

        // Enrich with token metadata for UI
        const enrichedPools = mapped.map((pool) => enrichPoolWithTokenInfo(pool, defaultChainId));

        setPools(enrichedPools);
      } catch (err) {
        console.error("Error fetching pools:", err);
        setError("Failed to fetch pools");
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [chainId]);

  const getPoolById = (id: string): Pool | undefined => {
    return pools.find((pool) => pool.id === id);
  };

  return {
    pools,
    loading,
    error,
    getPoolById,
  };
};
