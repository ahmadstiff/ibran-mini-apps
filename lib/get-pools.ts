import enrichPoolWithTokenInfo from "./pair-token-address";
import { fetchLendingPools } from "./graphql/lendingpool-list.fetch";

// Test function to verify API connection
export async function testPoolsAPI() {
  try {
    console.log("Testing Goldsky API connection...");
    const pools = await fetchLendingPools();
    console.log("API test successful. Found pools:", pools.length);
    return pools;
  } catch (error) {
    console.error("API test failed:", error);
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

    console.log("Fetched pools from API:", realPools);

    const mappedRealPools = realPools.map((pool) => ({
      id: pool.lendingPool, // Use lendingPool as the ID
      collateralToken: pool.collateralToken,
      borrowToken: pool.borrowToken,
      ltv: pool.ltv,
    }));

    const enrichedPools = mappedRealPools.map((pool) =>
      enrichPoolWithTokenInfo(pool, defaultChainId)
    );

    console.log("Enriched pools:", enrichedPools);
    return enrichedPools;
  } catch (error) {
    console.error("Error in getPools:", error);
    return [];
  }
}
