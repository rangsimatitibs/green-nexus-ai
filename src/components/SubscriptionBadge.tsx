import { Badge } from "@/components/ui/badge";
import { User, FlaskConical, Building2, Crown } from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

const tierConfig: Record<SubscriptionTier, {
  icon: typeof User;
  label: string;
  className: string;
  tooltip: string;
}> = {
  free: {
    icon: User,
    label: "Free",
    className: "bg-muted text-muted-foreground hover:bg-muted/80",
    tooltip: "Free tier - 5 searches/day",
  },
  researcher: {
    icon: FlaskConical,
    label: "Researcher",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    tooltip: "Researcher tier - Unlimited searches & research tools",
  },
  industry: {
    icon: Building2,
    label: "Industry",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    tooltip: "Industry tier - Full access including suppliers",
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
          <Link to="/pricing">
            <Badge 
              variant="outline" 
              className={`${config.className} cursor-pointer transition-colors ${
                size === "sm" ? "text-xs px-2 py-0.5" : ""
              }`}
            >
              <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} ${showLabel ? "mr-1" : ""}`} />
              {showLabel && config.label}
              {tier === 'industry' && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
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
