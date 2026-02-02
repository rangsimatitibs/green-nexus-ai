import { Progress } from "@/components/ui/progress";
import { Search, Sparkles, LogIn } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UsageMeterProps {
  className?: string;
  showUpgradeButton?: boolean;
}

const FREE_TIER_DAILY_LIMIT = 5;

export const UsageMeter = ({ className = "", showUpgradeButton = true }: UsageMeterProps) => {
  const { user } = useAuth();
  const { tier, dailyUsage, remainingSearches, loading } = useSubscription();

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sign in to Search</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Create a free account to get 5 AI-powered searches per day.
        </p>
        <div className="flex gap-2">
          <Link to="/auth" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Sign In
            </Button>
          </Link>
          <Link to="/signup" className="flex-1">
            <Button size="sm" className="w-full">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
