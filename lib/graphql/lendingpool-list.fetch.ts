import { graphClient } from "./client";
import { queryLendingPool } from "./lendingpool-list.query";

export type LendingPoolCreated = {
  id: string;
  lendingPool: `0x${string}`;
  borrowToken: `0x${string}`;
  collateralToken: `0x${string}`;
  ltv: string;
};

export async function fetchLendingPools(): Promise<LendingPoolCreated[]> {
  try {
    const query = queryLendingPool();
    console.log("Fetching lending pools from Goldsky API...");
    console.log("Query:", query);
    
    const data = await graphClient.request<{ lendingPoolCreateds: LendingPoolCreated[] }>(
      query
    );
    
    console.log("Raw API response:", data);
    
    if (!data) {
      console.warn("No data received from API");
      return [];
    }
    
    if (!data.lendingPoolCreateds) {
      console.warn("No lendingPoolCreateds found in API response. Available keys:", Object.keys(data));
      return [];
    }
    
    const pools = data.lendingPoolCreateds;
    console.log(`Found ${pools.length} lending pools`);
    
    // Validate pool data
    const validPools = pools.filter(pool => {
      if (!pool.lendingPool || !pool.borrowToken || !pool.collateralToken) {
        console.warn("Invalid pool data:", pool);
        return false;
      }
      return true;
    });
    
    console.log(`Valid pools: ${validPools.length}`);
    
    // Log first few pools for debugging
    if (validPools.length > 0) {
      console.log("Sample pool data:", validPools[0]);
    }
    
    return validPools;
  } catch (error) {
    console.error("Error fetching lending pools:", error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return [];
  }
}
