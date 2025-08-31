import { tokens } from "@/constants/tokenAddress";

export interface EnrichedPool {
  id: string;
  collateralToken: string;
  borrowToken: string;
  ltv: string;
  createdAt: string;
  blockNumber: string;
  transactionHash: string;
  borrowTokenInfo?: TokenInfo;
  collateralTokenInfo?: TokenInfo;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  logo: string;
  address: string;
  decimals: number;
}

interface RawPoolData {
  id?: string;
  collateral_token?: string;
  collateralToken?: string;
  borrow_token?: string;
  borrowToken?: string;
  ltv?: string;
  created_at?: string;
  createdAt?: string;
  block_number?: string;
  blockNumber?: string;
  transaction_hash?: string;
  transactionHash?: string;
}

// Interface untuk token addresses berdasarkan chain ID
interface TokenAddresses {
  [chainId: number]: string;
}

// Interface untuk token dari constants
interface Token {
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
  addresses?: TokenAddresses;
}

export default function enrichPoolWithTokenInfo(
  pool: RawPoolData | null | undefined,
  chainId = 1114,
): EnrichedPool {
  const getTokenInfo = (address: string): TokenInfo | undefined => {
    for (const t of tokens as Token[]) {
      const tokenAddr = t.addresses?.[chainId];
      if (tokenAddr && tokenAddr.toLowerCase() === address.toLowerCase()) {
        return {
          name: t.name,
          symbol: t.symbol,
          logo: t.logo,
          address: tokenAddr,
          decimals: t.decimals,
        };
      }
    }
    return undefined;
  };

  if (!pool) {
    return {
      id: "",
      collateralToken: "",
      borrowToken: "",
      ltv: "",
      createdAt: "",
      blockNumber: "",
      transactionHash: "",
    };
  }

  const normalizedPool = {
    id: pool.id || "",
    collateralToken: pool.collateral_token || pool.collateralToken || "",
    borrowToken: pool.borrow_token || pool.borrowToken || "",
    ltv: pool.ltv || "",
    createdAt: pool.created_at || pool.createdAt || "",
    blockNumber: pool.block_number || pool.blockNumber || "",
    transactionHash: pool.transaction_hash || pool.transactionHash || "",
  };

  return {
    ...normalizedPool,
    borrowTokenInfo: getTokenInfo(normalizedPool.borrowToken),
    collateralTokenInfo: getTokenInfo(normalizedPool.collateralToken),
  };
}
