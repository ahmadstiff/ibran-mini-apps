import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { EnrichedPool } from "@/lib/pair-token-address";
import { ActionModalView } from "@/components/dialog/action-dialog";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  market: EnrichedPool | null;
}

type Action =
  | "supply_liquidity"
  | "supply_collateral"
  | "withdraw_liquidity"
  | "withdraw_collateral"
  | "repay"
  | "borrow";

const actions: { value: Action; label: string }[] = [
  { value: "supply_liquidity", label: "Supply Liquidity" },
  { value: "supply_collateral", label: "Supply Collateral" },
  { value: "withdraw_liquidity", label: "Withdraw Liquidity" },
  { value: "withdraw_collateral", label: "Withdraw Collateral" },
  { value: "repay", label: "Repay" },
  { value: "borrow", label: "Borrow" },
];

export const DetailsModal = ({ open, onClose, market }: DetailsModalProps) => {
  const [selectedAction, setSelectedAction] = React.useState<Action>("supply_liquidity");

  // Reset txHash when action type changes
  React.useEffect(() => {
    // This will trigger a re-render of ActionModalView with fresh state
    // The hooks will be re-initialized with clean txHash state
  }, [selectedAction]);

  // Reset selectedAction when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedAction("supply_liquidity");
    }
  }, [open]);

  const handleActionSuccess = (amount: string, toChainId?: string) => {
    // For supply collateral, the hook handles the success internally
    // For other actions, we can add specific logic here if needed
  };

  const renderActionView = () => {
    if (!market) return null;
    return (
      <ActionModalView
        key={selectedAction} // Force re-creation when action changes
        type={selectedAction}
        market={market}
        onAction={handleActionSuccess}
      />
    );
  };

  if (!market) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl rounded-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            {market.borrowTokenInfo?.symbol || market.borrowToken} /{" "}
            {market.collateralTokenInfo?.symbol || market.collateralToken}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Select Action</label>
            <Select
              value={selectedAction}
              onValueChange={(value) => setSelectedAction(value as Action)}
            >
              <SelectTrigger className="w-full bg-slate-800/80  border-slate-600/50 hover:border-blue-500/60 text-slate-100 rounded-xl px-4 py-3 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 backdrop-blur-sm">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 text-white border border-slate-600/50 rounded-xl shadow-2xl z-[1000] max-h-60 backdrop-blur-xl">
                {actions.map((action) => (
                  <SelectItem key={action.value} value={action.value} className="hover:bg-slate-700/80 focus:bg-slate-700/80 rounded-lg mx-1 my-0.5 transition-colors duration-150">
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">{renderActionView()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
