import enrichPoolWithTokenInfo from "./pair-token-address";
import { fetchLendingPools } from "./graphql/lendingpool-list.fetch";

// Test function to verify API connection
export async function testPoolsAPI() {
  try {
    const pools = await fetchLendingPools();
    return pools;
  } catch (error) {
    throw error;
  }
}

// Using real GraphQL API data instead of mock pools
export async function getPools(chainId?: number) {
  try {
    const defaultChainId = chainId || 84532;

    const realPools = await fetchLendingPools();

    if (!realPools || realPools.length === 0) {
      console.warn("No lending pools found from API");
      return [];
    }

    const mappedRealPools = realPools.map((pool) => ({
      id: pool.lendingPool, // Use lendingPool as the ID
      collateralToken: pool.collateralToken,
      borrowToken: pool.borrowToken,
      ltv: pool.ltv,
    }));

    const enrichedPools = mappedRealPools.map((pool) =>
      enrichPoolWithTokenInfo(pool, defaultChainId)
    );

    return enrichedPools;
  } catch (error) {
    console.error("Error in getPools:", error);
    return [];
  }
}
