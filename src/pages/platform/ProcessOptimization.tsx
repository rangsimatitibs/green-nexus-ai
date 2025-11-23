import { Zap, Settings, LineChart, CheckCircle, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";

const ProcessOptimization = () => {
  const [temperature, setTemperature] = useState([25]);
  const [ph, setPh] = useState([7]);
  const [agitation, setAgitation] = useState([200]);
  const [optimization, setOptimization] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const tempDiff = Math.abs(temperature[0] - 37);
      const phDiff = Math.abs(ph[0] - 6.5);
      const agitationDiff = Math.abs(agitation[0] - 300);
      
      const currentYield = 100 - (tempDiff * 1.5 + phDiff * 3 + agitationDiff * 0.1);
      const optimizedYield = Math.min(98, currentYield + 15 + Math.random() * 10);
      
      setOptimization({
        current: {
          yield: Math.max(50, currentYield).toFixed(1),
          energy: (temperature[0] * 0.5 + agitation[0] * 0.02).toFixed(1),
          time: (24 - (agitation[0] / 50)).toFixed(1)
        },
        optimized: {
          temperature: 37,
          ph: 6.5,
          agitation: 300,
          yield: optimizedYield.toFixed(1),
          energy: (37 * 0.5 + 300 * 0.02).toFixed(1),
          time: (24 - (300 / 50)).toFixed(1)
        },
        improvements: {
          yield: ((optimizedYield - currentYield) / currentYield * 100).toFixed(1),
          energy: (((temperature[0] * 0.5 + agitation[0] * 0.02) - (37 * 0.5 + 300 * 0.02)) / (temperature[0] * 0.5 + agitation[0] * 0.02) * 100).toFixed(1),
          time: (((24 - (agitation[0] / 50)) - (24 - (300 / 50))) / (24 - (agitation[0] / 50)) * 100).toFixed(1)
        }
      });
      setIsOptimizing(false);
    }, 1500);
  };

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

      {/* Interactive Demo */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Try Process Optimization
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Adjust process parameters and see how AI optimizes for maximum efficiency
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Current Process Parameters</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Temperature (°C)</label>
                      <span className="text-sm text-muted-foreground">{temperature[0]}°C</span>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      min={20}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">pH Level</label>
                      <span className="text-sm text-muted-foreground">{ph[0]}</span>
                    </div>
                    <Slider
                      value={ph}
                      onValueChange={setPh}
                      min={4}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Agitation Speed (RPM)</label>
                      <span className="text-sm text-muted-foreground">{agitation[0]} RPM</span>
                    </div>
                    <Slider
                      value={agitation}
                      onValueChange={setAgitation}
                      min={100}
                      max={500}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full"
                size="lg"
              >
                {isOptimizing ? (
                  <>Optimizing...</>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Process
                  </>
                )}
              </Button>

              {optimization && (
                <div className="space-y-6 animate-fade-in border-t pt-6">
                  <h3 className="text-lg font-semibold text-foreground">Optimization Results</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-5 bg-muted/30">
                      <h4 className="font-semibold text-foreground mb-4">Current Performance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Yield</span>
                          <span className="font-semibold">{optimization.current.yield}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Energy</span>
                          <span className="font-semibold">{optimization.current.energy} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Time</span>
                          <span className="font-semibold">{optimization.current.time} hrs</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-5 bg-primary/5 border-primary/20">
                      <h4 className="font-semibold text-foreground mb-4">Optimized Performance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Yield</span>
                          <span className="font-semibold text-primary">{optimization.optimized.yield}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Energy</span>
                          <span className="font-semibold text-primary">{optimization.optimized.energy} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Time</span>
                          <span className="font-semibold text-primary">{optimization.optimized.time} hrs</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-5 bg-accent/5">
                    <h4 className="font-semibold text-foreground mb-4">Recommended Parameters</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Temperature</div>
                        <div className="text-xl font-bold text-accent">{optimization.optimized.temperature}°C</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">pH</div>
                        <div className="text-xl font-bold text-accent">{optimization.optimized.ph}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Agitation</div>
                        <div className="text-xl font-bold text-accent">{optimization.optimized.agitation} RPM</div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-foreground">Expected Improvements:</strong>
                      <span className="text-muted-foreground"> Yield +{Math.abs(parseFloat(optimization.improvements.yield))}%, 
                      Energy {parseFloat(optimization.improvements.energy) > 0 ? '+' : ''}{optimization.improvements.energy}%, 
                      Time {parseFloat(optimization.improvements.time) > 0 ? '+' : ''}{optimization.improvements.time}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
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
