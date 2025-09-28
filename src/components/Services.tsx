import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Zap, Target, ArrowRight } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Search,
      title: "Material Scouting",
      description: "AI-powered algorithms to discover and identify sustainable materials tailored to your specific requirements and applications.",
      features: ["Advanced AI matching", "Global material database", "Performance analytics"],
      gradient: "bg-gradient-primary"
    },
    {
      icon: CheckCircle,
      title: "Material Validation",
      description: "Comprehensive testing and validation processes to ensure sustainable materials meet your quality and performance standards.",
      features: ["Quality assurance", "Performance testing", "Compliance verification"],
      gradient: "bg-gradient-sustainable"
    },
    {
      icon: Zap,
      title: "Bioprocessing Optimization",
      description: "Advanced bioprocessing techniques and optimization strategies to enhance the production of sustainable materials.",
      features: ["Process optimization", "Efficiency improvements", "Cost reduction"],
      gradient: "bg-gradient-innovation"
    },
    {
      icon: Target,
      title: "Application Matching",
      description: "Intelligent matching system that connects sustainable materials with the most suitable applications and use cases.",
      features: ["Smart recommendations", "Use case analysis", "Market insights"],
      gradient: "bg-gradient-primary"
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Services
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Transforming Material Innovation
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered services helps you discover, validate, 
            and integrate sustainable materials into your existing processes seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-large transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${service.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300`}>
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full group/btn">
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="sustainable" size="lg" className="group">
            Explore All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;