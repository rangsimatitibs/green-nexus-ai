import { TrendingUp, Brain, BarChart3, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PropertyPrediction = () => {
  const capabilities = [
    {
      icon: Brain,
      title: "ML-Powered Predictions",
      description: "Neural networks trained on millions of material property measurements"
    },
    {
      icon: BarChart3,
      title: "Multi-Property Analysis",
      description: "Predict mechanical, thermal, electrical, and chemical properties simultaneously"
    },
    {
      icon: TrendingUp,
      title: "Uncertainty Quantification",
      description: "Get confidence intervals and reliability metrics with every prediction"
    }
  ];

  const useCases = [
    "Predicting mechanical strength before synthesis",
    "Estimating thermal conductivity of novel composites",
    "Forecasting biodegradation rates for new polymers",
    "Calculating electrical properties of doped materials",
    "Predicting material behavior under extreme conditions"
  ];

  const workflow = [
    { step: 1, title: "Input Structure", description: "Provide chemical composition or material structure" },
    { step: 2, title: "AI Processing", description: "Machine learning models analyze molecular features" },
    { step: 3, title: "Property Predictions", description: "Receive comprehensive property predictions with confidence scores" },
    { step: 4, title: "Validation Guidance", description: "Get experimental protocols to verify predictions" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Property Prediction
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Predict material properties before synthesis using advanced machine learning. 
              Accelerate R&D by virtually testing materials before lab work.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Start Predicting Properties
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
            How Property Prediction Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From molecular structure to accurate property predictions
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <Card key={item.step} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">{item.step}</span>
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
            Prediction Capabilities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            State-of-the-art models for accurate property forecasting
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8">
                <capability.icon className="h-12 w-12 text-accent mb-4" />
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
            Prediction Applications
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            How researchers use property prediction to accelerate development
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
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
            Model Specifications
          </h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Training Data</h3>
                <p className="text-muted-foreground">Models trained on 2M+ experimental measurements from peer-reviewed sources, Materials Project, and NIST databases</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">ML Architecture</h3>
                <p className="text-muted-foreground">Graph neural networks, random forests, and ensemble methods optimized for different property types</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Predicted Properties</h3>
                <p className="text-muted-foreground">Tensile strength, Young's modulus, thermal conductivity, electrical resistivity, melting point, glass transition temperature, biodegradation rate, toxicity indicators</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Accuracy Metrics</h3>
                <p className="text-muted-foreground">Mean absolute error within 15% for most properties, R² scores &gt; 0.85, validated against held-out experimental data</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Accelerate Your Material Development
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Reduce experimental cycles and costs with accurate property predictions
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Start Predicting Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyPrediction;
