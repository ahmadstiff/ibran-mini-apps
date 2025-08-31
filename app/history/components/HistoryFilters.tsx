import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funnel, RefreshCw, Loader2, BarChart3, TrendingUp, Wallet, Clock, BarChart2 } from "lucide-react";

interface HistoryFiltersProps {
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filterType,
  onFilterTypeChange,
  onRefresh,
  loading,
}) => {
  return (
    <Card className="bg-gray-900 text-gray-100 shadow-xl border border-cyan-800">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
              <Funnel className="w-4 h-4" />
              <span>Filter by:</span>
            </div>

            {/* Type Filter */}
            <div className="w-full sm:w-64">
              <Select value={filterType} onValueChange={onFilterTypeChange}>
                <SelectTrigger className="w-full bg-gray-800 border border-cyan-800 text-gray-100 hover:border-cyan-700 transition-all duration-300 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-600">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-gray-100 border border-cyan-800 backdrop-blur-sm max-h-60">
                  <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      All Types
                    </div>
                  </SelectItem>
                  <SelectItem value="supply_liquidity" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Supply Liquidity
                    </div>
                  </SelectItem>
                  <SelectItem value="withdraw_liquidity" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      Withdraw Liquidity
                    </div>
                  </SelectItem>
                  <SelectItem value="borrow_debt" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-yellow-400" />
                      Borrow Debt
                    </div>
                  </SelectItem>
                  <SelectItem value="repay_collateral" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                      Repay Collateral
                    </div>
                  </SelectItem>
                  <SelectItem value="supply_collateral" className="hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Supply Collateral
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Refresh Button */}
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="bg-transparent items-center text-blue-300 border border-cyan-800 hover:border-cyan-500 hover:bg-cyan-800/20 hover:text-blue-200 font-medium px-6 py-2 h-10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryFilters;
