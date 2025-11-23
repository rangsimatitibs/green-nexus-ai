import { Target, Layers, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ApplicationMatching = () => {
  const capabilities = [
    {
      icon: Target,
      title: "Reverse Material Search",
      description: "Start with your application requirements and find materials that fit perfectly"
    },
    {
      icon: Layers,
      title: "Multi-Criteria Optimization",
      description: "Balance performance, cost, sustainability, and availability simultaneously"
    },
    {
      icon: Sparkles,
      title: "Novel Material Suggestions",
      description: "Discover unconventional materials that traditional search methods might miss"
    }
  ];

  const useCases = [
    "Matching biomaterials to medical device applications",
    "Finding suitable polymers for 3D printing applications",
    "Identifying materials for high-temperature industrial processes",
    "Selecting sustainable materials for consumer product design",
    "Matching materials to specific regulatory requirements"
  ];

  const workflow = [
    { step: 1, title: "Describe Application", description: "Input your use case, performance needs, and constraints" },
    { step: 2, title: "AI Analysis", description: "Algorithms analyze functional requirements and operating conditions" },
    { step: 3, title: "Material Recommendations", description: "Receive ranked list of suitable materials with scores" },
    { step: 4, title: "Validation Support", description: "Get testing protocols and validation guidelines for top candidates" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Application Matching
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Match materials to applications with precision. Our AI analyzes your requirements 
              and recommends the optimal materials for your specific use case.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Find Your Perfect Material Match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            How Application Matching Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From application requirements to validated material recommendations
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <Card key={item.step} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Advanced Matching Capabilities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Intelligent algorithms that understand your application needs
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8">
                <capability.icon className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{capability.title}</h3>
                <p className="text-muted-foreground">{capability.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Application Examples
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Industries leveraging application matching for material selection
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <p className="text-foreground">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Matching Methodology
          </h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Input Parameters</h3>
                <p className="text-muted-foreground">Application environment, mechanical requirements, chemical resistance, temperature range, regulatory constraints, sustainability goals</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Matching Algorithms</h3>
                <p className="text-muted-foreground">Multi-objective optimization, constraint satisfaction, similarity scoring, and expert system rules validated by material scientists</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Output Details</h3>
                <p className="text-muted-foreground">Ranked material candidates with match scores, trade-off analysis, alternative options, supplier availability, and estimated costs</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Validation Rate</h3>
                <p className="text-muted-foreground">85%+ of top-3 recommendations proceed to testing phase, reducing trial-and-error by 60%</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Find the Perfect Material for Your Application
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Save time and reduce costs with AI-powered material matching
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Start Matching Materials Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApplicationMatching;
