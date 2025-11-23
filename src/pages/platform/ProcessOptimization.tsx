import { Zap, Settings, LineChart, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ProcessOptimization = () => {
  const capabilities = [
    {
      icon: Settings,
      title: "Parameter Optimization",
      description: "Fine-tune temperature, pressure, pH, and other process variables for optimal results"
    },
    {
      icon: LineChart,
      title: "Yield Maximization",
      description: "Increase production efficiency while maintaining quality and sustainability"
    },
    {
      icon: Zap,
      title: "Energy Reduction",
      description: "Minimize energy consumption and environmental impact of bioprocessing"
    }
  ];

  const useCases = [
    "Optimizing fermentation conditions for biopolymer production",
    "Reducing energy consumption in material synthesis processes",
    "Improving yield in enzymatic conversion reactions",
    "Minimizing waste generation in bioprocessing workflows",
    "Scaling laboratory processes to industrial production"
  ];

  const workflow = [
    { step: 1, title: "Process Baseline", description: "Input current process parameters and performance metrics" },
    { step: 2, title: "AI Optimization", description: "Algorithms identify optimal parameter combinations" },
    { step: 3, title: "Simulation", description: "Virtual testing of optimized conditions before implementation" },
    { step: 4, title: "Implementation Guide", description: "Step-by-step protocols for process improvements" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Process Optimization
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Optimize bioprocessing and material synthesis with AI-driven parameter tuning. 
              Maximize yield, minimize costs, and reduce environmental impact.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Optimize Your Processes
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
            How Process Optimization Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From current state analysis to optimized production protocols
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
            Optimization Capabilities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Comprehensive tools for bioprocessing efficiency
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
            Optimization Applications
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Industries improving efficiency through process optimization
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
            Optimization Methodology
          </h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Optimization Targets</h3>
                <p className="text-muted-foreground">Yield, purity, production rate, energy consumption, waste generation, equipment utilization, cost per unit</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Optimization Algorithms</h3>
                <p className="text-muted-foreground">Genetic algorithms, Bayesian optimization, response surface methodology, and reinforcement learning for dynamic processes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Process Variables</h3>
                <p className="text-muted-foreground">Temperature profiles, pH control, agitation speed, substrate feeding rates, oxygen transfer, retention time, catalyst loading</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Typical Improvements</h3>
                <p className="text-muted-foreground">15-40% yield increase, 20-35% energy reduction, 25-50% faster optimization vs traditional DOE methods</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Transform Your Bioprocessing Efficiency
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join companies achieving breakthrough efficiency improvements with AI optimization
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Start Optimizing Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProcessOptimization;
