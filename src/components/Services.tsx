import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Zap, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      id: "material-scouting",
      icon: Search,
      title: "Material Scouting",
      description: "AI-powered algorithms to discover and identify sustainable materials tailored to your specific requirements and applications.",
      features: ["Advanced AI matching", "Global material database", "Performance analytics"],
      gradient: "bg-gradient-primary"
    },
    {
      id: "material-validation",
      icon: CheckCircle,
      title: "Material Validation",
      description: "Comprehensive testing and validation processes to ensure sustainable materials meet your quality and performance standards.",
      features: ["Quality assurance", "Performance testing", "Compliance verification"],
      gradient: "bg-gradient-sustainable"
    },
    {
      id: "bioprocessing",
      icon: Zap,
      title: "Bioprocessing Optimization",
      description: "Advanced bioprocessing techniques and optimization strategies to enhance the production of sustainable materials.",
      features: ["Process optimization", "Efficiency improvements", "Cost reduction"],
      gradient: "bg-gradient-innovation"
    },
    {
      id: "application-matching",
      icon: Target,
      title: "Application Matching",
      description: "Intelligent matching system that connects sustainable materials with the most suitable applications and use cases.",
      features: ["Smart recommendations", "Use case analysis", "Market insights"],
      gradient: "bg-gradient-primary"
    }
  ];

  return (
    <section id="services" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" />
            Material AI Platform Services
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Smart Materials Discovery & <br className="hidden sm:block" />
            <span className="bg-gradient-sustainable bg-clip-text text-transparent">Material Informatics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover, validate, and integrate smart materials seamlessly with our AI-powered material informatics platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-card hover:-translate-y-1">
              <CardHeader className="pb-6">
                <div className={`w-16 h-16 ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-500`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors mb-3">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={`/services#${service.id}`}>
                  <Button variant="ghost" className="w-full group/btn font-semibold">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-20">
          <Link to="/services">
            <Button size="lg" className="bg-gradient-sustainable text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold group">
              Explore All Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;