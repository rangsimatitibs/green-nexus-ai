import { Search, Database, Target, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const MaterialScouting = () => {
  const capabilities = [
    {
      icon: Database,
      title: "Comprehensive Database Access",
      description: "Search across millions of materials from scientific literature, patents, and material databases"
    },
    {
      icon: Target,
      title: "Property-Based Filtering",
      description: "Define target properties like conductivity, strength, or biodegradability to find exact matches"
    },
    {
      icon: Search,
      title: "AI-Powered Discovery",
      description: "Machine learning algorithms identify novel materials you might have missed"
    }
  ];

  const useCases = [
    "Finding sustainable alternatives to traditional plastics",
    "Discovering materials with specific mechanical properties",
    "Identifying biodegradable materials for packaging applications",
    "Scouting materials for energy storage applications",
    "Finding bio-based alternatives to synthetic materials"
  ];

  const workflow = [
    { step: 1, title: "Define Requirements", description: "Specify your material property requirements and constraints" },
    { step: 2, title: "AI Search", description: "Our algorithms scan databases and literature for matching materials" },
    { step: 3, title: "Results Ranking", description: "Materials ranked by relevance, availability, and sustainability" },
    { step: 4, title: "Detailed Reports", description: "Get comprehensive data sheets with properties, suppliers, and references" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Material Scouting
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover sustainable materials faster with AI-powered search across global databases. 
              Find the perfect material for your application from millions of options.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Start Scouting Materials
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
            How Material Scouting Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our AI-powered workflow streamlines material discovery from search to selection
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <Card key={item.step} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
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
            Key Capabilities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Advanced features designed for material scientists and engineers
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8">
                <capability.icon className="h-12 w-12 text-primary mb-4" />
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
            Real-World Applications
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            How material scientists use our scouting platform
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
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
            Technical Specifications
          </h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Sources</h3>
                <p className="text-muted-foreground">Access to 5M+ materials from scientific journals, patents, Material Project, NIST databases, and industry repositories</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Search Algorithms</h3>
                <p className="text-muted-foreground">Natural language processing, semantic search, and machine learning models for intelligent material matching</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Output Formats</h3>
                <p className="text-muted-foreground">Detailed material data sheets, property charts, supplier information, sustainability scores, and citation references</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Accuracy</h3>
                <p className="text-muted-foreground">95%+ relevance in search results, validated against expert material selections</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Discover Your Next Material?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join researchers and engineers using AI to accelerate material discovery
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Get Started with Material Scouting
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaterialScouting;
