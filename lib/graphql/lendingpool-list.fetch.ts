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
    
    const data = await graphClient.request<{ lendingPoolCreateds: LendingPoolCreated[] }>(
      query
    );
    
    
    if (!data) {
      console.warn("No data received from API");
      return [];
    }
    
    if (!data.lendingPoolCreateds) {
      console.warn("No lendingPoolCreateds found in API response. Available keys:", Object.keys(data));
      return [];
    }
    
    const pools = data.lendingPoolCreateds;

    // Validate pool data
    const validPools = pools.filter(pool => {
      if (!pool.lendingPool || !pool.borrowToken || !pool.collateralToken) {
        console.warn("Invalid pool data:", pool);
        return false;
      }
      return true;
    });
    
    
    
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
