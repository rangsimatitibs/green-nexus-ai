import { Badge } from "@/components/ui/badge";
import { User, FlaskConical, Building2, Crown, Star } from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

const tierConfig: Record<SubscriptionTier, {
  icon: typeof User;
  label: string;
  className: string;
  tooltip: string;
  showCrown?: boolean;
}> = {
  free: {
    icon: User,
    label: "Free",
    className: "bg-muted text-muted-foreground hover:bg-muted/80",
    tooltip: "Free tier - 5 searches/day",
  },
  researcher_lite: {
    icon: FlaskConical,
    label: "Researcher Lite",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    tooltip: "Researcher Lite - 100 searches/month & research tools",
  },
  researcher_premium: {
    icon: Star,
    label: "Researcher Premium",
    className: "bg-blue-600/10 text-blue-700 border-blue-600/20 hover:bg-blue-600/20",
    tooltip: "Researcher Premium - Unlimited searches & all research tools",
    showCrown: true,
  },
  industry_lite: {
    icon: Building2,
    label: "Industry Lite",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
    tooltip: "Industry Lite - 100 searches/month & supplier access",
  },
  industry_premium: {
    icon: Crown,
    label: "Industry Premium",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    tooltip: "Industry Premium - Full access with API & dedicated support",
    showCrown: true,
  },
};

interface SubscriptionBadgeProps {
  showLabel?: boolean;
  size?: "sm" | "default";
}

export const SubscriptionBadge = ({ 
  showLabel = true, 
  size = "default" 
}: SubscriptionBadgeProps) => {
  const { tier, loading } = useSubscription();

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse bg-muted">
        <span className="w-12 h-4" />
      </Badge>
    );
  }

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/subscriptions">
            <Badge 
              variant="outline" 
              className={`${config.className} cursor-pointer transition-colors ${
                size === "sm" ? "text-xs px-2 py-0.5" : ""
              }`}
            >
              <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} ${showLabel ? "mr-1" : ""}`} />
              {showLabel && config.label}
              {config.showCrown && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to manage subscription</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SubscriptionBadge;
