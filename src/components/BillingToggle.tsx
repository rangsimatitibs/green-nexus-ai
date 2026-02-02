import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BillingPeriod = 'monthly' | 'annual';

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}

export const BillingToggle = ({ value, onChange }: BillingToggleProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
        <button
          onClick={() => onChange('monthly')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
            value === 'monthly'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange('annual')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
            value === 'annual'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Annual
          {value === 'annual' && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-500 text-xs">
              Save 17%
            </Badge>
          )}
        </button>
      </div>
      {value === 'annual' && (
        <p className="text-sm text-green-600 font-medium">
          🎉 Get 2 months free with annual billing
        </p>
      )}
    </div>
  );
};
