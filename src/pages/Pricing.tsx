import { Check, Sparkles, Search, FlaskConical, Factory, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic material discovery",
    tier: "free" as const,
    features: [
      "5 AI-powered searches per day",
      "Access to material database",
      "Basic material properties",
      "Sustainability scores",
      "Email support",
    ],
    notIncluded: [
      "Supplier contact information",
      "Lab recipes & research tools",
      "Process optimization",
      "Priority support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Researcher",
    price: "$49",
    period: "/month",
    description: "Advanced tools for research and development",
    tier: "researcher" as const,
    features: [
      "Unlimited AI searches",
      "Full material database access",
      "Detailed property analysis",
      "Lab recipes & protocols",
      "Bibliography search tools",
      "Research material library",
      "Property prediction (AI)",
      "Export reports (PDF)",
      "Email & chat support",
    ],
    notIncluded: [
      "Supplier pricing details",
      "Process optimization",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Industry",
    price: "$199",
    period: "/month",
    description: "Complete solution for production teams",
    tier: "industry" as const,
    features: [
      "Everything in Researcher",
      "Supplier contact & pricing",
      "Process optimization tools",
      "Batch simulation",
      "Equipment recommendations",
      "Regulatory compliance data",
      "API access",
      "Dedicated account manager",
      "Priority support",
      "Custom integrations",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();

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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as your needs grow. All plans include access to our AI-powered material discovery platform.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative flex flex-col ${
                  tier.popular 
                    ? "border-primary shadow-lg scale-105" 
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
                  <div className="mb-2">
                    {tier.tier === "free" && <Search className="h-8 w-8 mx-auto text-muted-foreground" />}
                    {tier.tier === "researcher" && <FlaskConical className="h-8 w-8 mx-auto text-primary" />}
                    {tier.tier === "industry" && <Factory className="h-8 w-8 mx-auto text-amber-500" />}
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 opacity-50">
                        <span className="h-5 w-5 shrink-0 mt-0.5 flex items-center justify-center text-muted-foreground">—</span>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {user && currentTier === tier.tier ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : tier.tier === "free" ? (
                    <Link to={user ? "/platform/material-scouting" : "/signup"} className="w-full">
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                        {tier.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => {
                        // TODO: Integrate with Stripe checkout
                        alert("Payment integration coming soon! Contact us at hello@materialink.io");
                      }}
                    >
                      {tier.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
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
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Researcher</th>
                  <th className="text-center py-4 px-4">Industry</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">AI Searches</td>
                  <td className="text-center py-4 px-4">5/day</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Material Properties</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Sustainability Scores</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Lab Recipes</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Bibliography Search</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Property Prediction (AI)</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Supplier Information</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">Process Optimization</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4 font-medium">API Access</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4 text-muted-foreground">—</td>
                  <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
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
              <h3 className="font-semibold text-lg mb-2">Do I need a credit card to start?</h3>
              <p className="text-muted-foreground">
                No credit card required for the Free tier. You only need to provide payment information when you decide to upgrade to Researcher or Industry plans.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">What's included in AI searches?</h3>
              <p className="text-muted-foreground">
                AI searches use our proprietary algorithms to scan scientific databases, patents, and research literature to find materials matching your requirements. Results include property data, sustainability scores, and application recommendations.
              </p>
            </div>
            
            <div className="pb-6">
              <h3 className="font-semibold text-lg mb-2">Do you offer team or enterprise pricing?</h3>
              <p className="text-muted-foreground">
                Yes! For teams larger than 5 users or enterprise needs, contact us at hello@materialink.io for custom pricing and features.
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

export default Pricing;
