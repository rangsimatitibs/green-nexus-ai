import { useState } from "react";
import { Check, Sparkles, Search, FlaskConical, Factory, Crown, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import { BillingToggle, BillingPeriod } from "@/components/BillingToggle";
import { Link } from "react-router-dom";

interface TierConfig {
  name: string;
  tier: SubscriptionTier;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  searchLimit: string;
  features: string[];
  notIncluded: string[];
  cta: string;
  popular: boolean;
  icon: React.ReactNode;
  variant: 'free' | 'lite' | 'premium';
}

const tiers: TierConfig[] = [
  {
    name: "Free",
    tier: "free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Get started with basic material discovery",
    searchLimit: "5 searches/day",
    features: [
      "5 AI-powered searches per day",
      "Access to material database",
      "Basic material properties",
      "Sustainability scores",
      "Email support",
    ],
    notIncluded: [
      "Lab recipes & research tools",
      "Supplier contact information",
      "Process optimization",
      "Priority support",
    ],
    cta: "Get Started",
    popular: false,
    icon: <Search className="h-8 w-8 text-muted-foreground" />,
    variant: 'free',
  },
  {
    name: "Researcher Lite",
    tier: "researcher_lite",
    monthlyPrice: 29,
    annualPrice: 290,
    description: "Essential tools for research teams",
    searchLimit: "100 searches/month",
    features: [
      "100 AI searches per month",
      "Full material database access",
      "Detailed property analysis",
      "Lab recipes & protocols",
      "Bibliography search tools",
      "Research material library",
      "Email & chat support",
    ],
    notIncluded: [
      "Unlimited searches",
      "Supplier information",
      "Process optimization",
    ],
    cta: "Start Free Trial",
    popular: false,
    icon: <FlaskConical className="h-8 w-8 text-blue-500" />,
    variant: 'lite',
  },
  {
    name: "Researcher Premium",
    tier: "researcher_premium",
    monthlyPrice: 49,
    annualPrice: 490,
    description: "Unlimited access for serious researchers",
    searchLimit: "Unlimited searches",
    features: [
      "Unlimited AI searches",
      "Full material database access",
      "Detailed property analysis",
      "Lab recipes & protocols",
      "Bibliography search tools",
      "Research material library",
      "Property prediction (AI)",
      "Export reports (PDF)",
      "Priority email & chat support",
    ],
    notIncluded: [
      "Supplier information",
      "Process optimization",
    ],
    cta: "Start Free Trial",
    popular: true,
    icon: <Star className="h-8 w-8 text-blue-600" />,
    variant: 'premium',
  },
  {
    name: "Industry Lite",
    tier: "industry_lite",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "Essential tools for production teams",
    searchLimit: "100 searches/month",
    features: [
      "100 AI searches per month",
      "Everything in Researcher Premium",
      "Supplier contact & pricing",
      "Process optimization tools",
      "Batch simulation",
      "Equipment recommendations",
      "Regulatory compliance data",
    ],
    notIncluded: [
      "Unlimited searches",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: <Factory className="h-8 w-8 text-amber-500" />,
    variant: 'lite',
  },
  {
    name: "Industry Premium",
    tier: "industry_premium",
    monthlyPrice: 249,
    annualPrice: 2490,
    description: "Complete solution for enterprise teams",
    searchLimit: "Unlimited searches",
    features: [
      "Unlimited AI searches",
      "Everything in Industry Lite",
      "API access",
      "Dedicated account manager",
      "Priority support",
      "Custom integrations",
      "SLA guarantees",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
    icon: <Crown className="h-8 w-8 text-amber-600" />,
    variant: 'premium',
  },
];

const Subscriptions = () => {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const getPrice = (tier: TierConfig) => {
    return billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
  };

  const getMonthlyEquivalent = (tier: TierConfig) => {
    if (billingPeriod === 'annual' && tier.annualPrice > 0) {
      return (tier.annualPrice / 12).toFixed(2);
    }
    return null;
  };

  const getSavings = (tier: TierConfig) => {
    if (billingPeriod === 'annual' && tier.monthlyPrice > 0) {
      return tier.monthlyPrice * 12 - tier.annualPrice;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4" variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free and scale as your needs grow. All plans include access to our AI-powered material discovery platform.
          </p>
          
          {/* Billing Toggle */}
          <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative flex flex-col ${
                  tier.popular 
                    ? "border-primary shadow-lg scale-105 z-10" 
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-2 flex justify-center">
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      ${getPrice(tier)}
                    </span>
                    <span className="text-muted-foreground">
                      {billingPeriod === 'monthly' ? '/mo' : '/yr'}
                    </span>
                  </div>
                  {getMonthlyEquivalent(tier) && (
                    <p className="text-sm text-muted-foreground">
                      (${getMonthlyEquivalent(tier)}/month)
                    </p>
                  )}
                  {getSavings(tier) > 0 && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                      Save ${getSavings(tier)}/year
                    </Badge>
                  )}
                  <CardDescription className="mt-2 text-xs">{tier.description}</CardDescription>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {tier.searchLimit}
                  </Badge>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 opacity-50">
                        <span className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center text-muted-foreground text-xs">—</span>
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {user && currentTier === tier.tier ? (
                    <Button className="w-full" variant="outline" disabled size="sm">
                      Current Plan
                    </Button>
                  ) : tier.tier === "free" ? (
                    <Link to={user ? "/platform/material-scouting" : "/signup"} className="w-full">
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"} size="sm">
                        {tier.cta}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        alert("Payment integration coming soon! Contact us at Rangsimatiti.b.s@gmail.com");
                      }}
                    >
                      {tier.cta}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-2">Free</th>
                  <th className="text-center py-4 px-2">Researcher Lite</th>
                  <th className="text-center py-4 px-2">Researcher Premium</th>
                  <th className="text-center py-4 px-2">Industry Lite</th>
                  <th className="text-center py-4 px-2">Industry Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">AI Searches</td>
                  <td className="text-center py-4 px-2">5/day</td>
                  <td className="text-center py-4 px-2">100/mo</td>
                  <td className="text-center py-4 px-2">Unlimited</td>
                  <td className="text-center py-4 px-2">100/mo</td>
                  <td className="text-center py-4 px-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Material Properties</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Sustainability Scores</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Lab Recipes</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Bibliography Search</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Property Prediction (AI)</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Supplier Information</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Process Optimization</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">API Access</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Dedicated Account Manager</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-2"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">Can I try before I subscribe?</h3>
              <p className="text-muted-foreground">
                Yes! Our Free tier gives you 5 AI-powered searches per day, forever. You can explore the platform and see results before upgrading. Simply create an account to get started.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">What's the difference between Lite and Premium plans?</h3>
              <p className="text-muted-foreground">
                Lite plans include 100 searches per month and core features. Premium plans offer unlimited searches and advanced features like AI property prediction, priority support, and for Industry Premium, API access and a dedicated account manager.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">Do I save money with annual billing?</h3>
              <p className="text-muted-foreground">
                Yes! Annual billing saves you approximately 17% compared to monthly billing — that's equivalent to getting 2 months free. You can switch between billing periods at any time.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">What happens when I reach my search limit?</h3>
              <p className="text-muted-foreground">
                For Free users, your daily limit resets at midnight. For Lite plan users, your monthly limit resets on the first of each month. You can always upgrade to a Premium plan for unlimited searches.
              </p>
            </div>
            
            <div className="pb-6">
              <h3 className="font-semibold text-lg mb-2">Do you offer team or enterprise pricing?</h3>
              <p className="text-muted-foreground">
                Yes! For teams larger than 5 users or enterprise needs, contact us at Rangsimatiti.b.s@gmail.com for custom pricing and features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Material Discovery?</h2>
          <p className="text-muted-foreground mb-8">
            Join researchers and industry professionals using MateriaLink to find sustainable materials faster.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Start Free Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Subscriptions;
