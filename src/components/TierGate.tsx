import { Lock, Sparkles, Building2, FlaskConical, User, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";

interface TierGateProps {
  requiredTier: SubscriptionTier;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const tierConfig: Record<SubscriptionTier, {
  icon: typeof User;
  label: string;
  color: string;
  bgColor: string;
  price?: string;
  features?: string[];
}> = {
  free: {
    icon: User,
    label: "Free",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  researcher_lite: {
    icon: FlaskConical,
    label: "Researcher Lite",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    price: "$29/month",
    features: [
      "100 material searches per month",
      "Full property data with AI predictions",
      "Bibliography search & paper discovery",
      "Lab Recipes access",
      "Research Library access",
      "Export citations and data",
    ],
  },
  researcher_premium: {
    icon: Star,
    label: "Researcher Premium",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    price: "$49/month",
    features: [
      "Unlimited material searches",
      "Full property data with AI predictions",
      "Bibliography search & paper discovery",
      "Lab Recipes access",
      "Research Library access",
      "Priority support",
    ],
  },
  industry_lite: {
    icon: Building2,
    label: "Industry Lite",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    price: "$149/month",
    features: [
      "100 material searches per month",
      "Everything in Researcher Premium",
      "Supplier Database Access",
      "Company contact details",
      "Pricing & MOQ data",
      "Lead time information",
    ],
  },
  industry_premium: {
    icon: Crown,
    label: "Industry Premium",
    color: "text-primary",
    bgColor: "bg-primary/10",
    price: "$249/month",
    features: [
      "Unlimited material searches",
      "Everything in Industry Lite",
      "API Access",
      "Dedicated account manager",
      "Priority support",
      "Custom integrations",
    ],
  },
};

const TierGate = ({ 
  requiredTier, 
  title, 
  description, 
  children 
}: TierGateProps) => {
  const { hasFeatureAccess, tier: currentTier, loading } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // If user has access, show the content
  if (hasFeatureAccess(requiredTier)) {
    return <>{children}</>;
  }

  // Otherwise show the gate
  const config = tierConfig[requiredTier];
  const Icon = config.icon;

  const isIndustryTier = requiredTier === 'industry_lite' || requiredTier === 'industry_premium';
  
  const defaultTitle = isIndustryTier 
    ? "Industry Access Required"
    : "Researcher Access Required";

  const defaultDescription = isIndustryTier
    ? "Access supplier information, pricing, and contact details with an Industry subscription."
    : "Unlock advanced research tools, bibliography search, and lab recipes with a Researcher subscription.";

  return (
    <div className="relative">
      {/* Blurred background content */}
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center bg-background/95 backdrop-blur border-primary/20 shadow-xl">
          <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {title || defaultTitle}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {description || defaultDescription}
          </p>

          {config.price && (
            <p className="text-lg font-semibold text-primary mb-4">
              Starting at {config.price}
            </p>
          )}

          {config.features && (
            <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <Link to="/subscriptions">
            <Button variant="hero" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to {config.label}
            </Button>
          </Link>

          {currentTier !== 'free' && (
            <p className="text-xs text-muted-foreground mt-4">
              Current plan: <span className="font-medium">{tierConfig[currentTier].label}</span>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TierGate;
