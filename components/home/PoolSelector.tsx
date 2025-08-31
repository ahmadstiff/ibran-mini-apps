import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { EnrichedPool } from "@/lib/pair-token-address";
import { motion, AnimatePresence } from "framer-motion";

interface PoolSelectorProps {
  pools: EnrichedPool[];
  selectedPool: EnrichedPool | null;
  loading: boolean;
  onSelectPool: (pool: EnrichedPool) => void;
}

export const PoolSelector: React.FC<PoolSelectorProps> = ({
  pools,
  selectedPool,
  loading,
  onSelectPool,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors w-full"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" className="text-gray-400" />
          </div>
        ) : selectedPool ? (
          <>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 md:gap-2 flex-1">
                {selectedPool.borrowTokenInfo?.logo && (
                  <Image
                    src={selectedPool.borrowTokenInfo.logo}
                    alt={selectedPool.borrowTokenInfo.symbol}
                    width={20}
                    height={20}
                    className="rounded-full md:w-6 md:h-6"
                  />
                )}
                <span className="text-white font-medium text-sm md:text-base truncate">
                  {selectedPool.borrowTokenInfo?.symbol || selectedPool.borrowToken}
                </span>
              </div>
              <div className="flex items-center justify-center px-2 md:px-4">
                <span className="text-gray-400 text-xs md:text-sm">→</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                {selectedPool.collateralTokenInfo?.logo && (
                  <Image
                    src={selectedPool.collateralTokenInfo.logo}
                    alt={selectedPool.collateralTokenInfo.symbol}
                    width={20}
                    height={20}
                    className="rounded-full md:w-6 md:h-6"
                  />
                )}
                <span className="text-white font-medium text-sm md:text-base truncate">
                  {selectedPool.collateralTokenInfo?.symbol || selectedPool.collateralToken}
                </span>
              </div>
            </div>
          </>
        ) : (
          <span className="text-gray-400 text-sm md:text-base">Select Pool</span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-full"
          >
            {loading ? (
              <div className="px-3 md:px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
                <Spinner size="sm" className="text-gray-400" />
                Loading pools...
              </div>
            ) : pools.length === 0 ? (
              <div className="px-3 md:px-4 py-3 text-gray-400 text-sm">No pools available</div>
            ) : (
              pools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => {
                    onSelectPool(pool);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-1 md:gap-2 px-3 md:px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1 md:gap-2 flex-1">
                      {pool.borrowTokenInfo?.logo && (
                        <Image
                          src={pool.borrowTokenInfo.logo}
                          alt={pool.borrowTokenInfo.symbol}
                          width={18}
                          height={18}
                          className="rounded-full md:w-5 md:h-5"
                        />
                      )}
                      <span className="text-white text-xs md:text-sm truncate">
                        {pool.borrowTokenInfo?.symbol || pool.borrowToken}
                      </span>
                    </div>
                    <div className="flex items-center justify-center px-2">
                      <span className="text-gray-400 text-xs">→</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                      {pool.collateralTokenInfo?.logo && (
                        <Image
                          src={pool.collateralTokenInfo.logo}
                          alt={pool.collateralTokenInfo.symbol}
                          width={18}
                          height={18}
                          className="rounded-full md:w-5 md:h-5"
                        />
                      )}
                      <span className="text-white text-xs md:text-sm truncate">
                        {pool.collateralTokenInfo?.symbol || pool.collateralToken}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
