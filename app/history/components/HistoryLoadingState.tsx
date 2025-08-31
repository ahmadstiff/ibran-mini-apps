import React from "react";
import { Loader2 } from "lucide-react";

const HistoryLoadingState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="relative">
        <div className="relative bg-gray-800 p-4 rounded-full border border-cyan-800 mx-auto w-16 h-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
      <p className="text-gray-400 mt-4 font-medium">Loading your transactions...</p>
    </div>
  );
};

export default HistoryLoadingState;
