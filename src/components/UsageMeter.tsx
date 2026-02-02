import { Progress } from "@/components/ui/progress";
import { Search, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UsageMeterProps {
  className?: string;
  showUpgradeButton?: boolean;
}

const FREE_TIER_DAILY_LIMIT = 5;

export const UsageMeter = ({ className = "", showUpgradeButton = true }: UsageMeterProps) => {
  const { tier, dailyUsage, remainingSearches, loading } = useSubscription();

  // Don't show for paid tiers
  if (tier !== 'free' || loading) {
    return null;
  }

  const usedSearches = dailyUsage?.searchCount || 0;
  const percentage = (usedSearches / FREE_TIER_DAILY_LIMIT) * 100;
  const isLow = remainingSearches <= 2;
  const isExhausted = remainingSearches === 0;

  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Daily Searches</span>
        </div>
        <span className={`text-sm font-semibold ${
          isExhausted ? "text-destructive" : isLow ? "text-yellow-600" : "text-foreground"
        }`}>
          {remainingSearches} / {FREE_TIER_DAILY_LIMIT} remaining
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${isExhausted ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-yellow-500" : ""}`}
      />
      
      {isExhausted && (
        <p className="text-xs text-destructive mt-2">
          You've reached your daily limit. Upgrade for unlimited searches!
        </p>
      )}
      
      {isLow && !isExhausted && (
        <p className="text-xs text-yellow-600 mt-2">
          Running low on searches. Consider upgrading for unlimited access.
        </p>
      )}

      {showUpgradeButton && (isLow || isExhausted) && (
        <Link to="/pricing">
          <Button 
            variant={isExhausted ? "default" : "outline"} 
            size="sm" 
            className="w-full mt-3"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade for Unlimited
          </Button>
        </Link>
      )}
    </div>
  );
};

export default UsageMeter;
