import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle, Zap, Target, ArrowRight, Leaf, Globe, TrendingUp } from "lucide-react";
import materialScoutingBg from "@/assets/material-scouting-bg.jpg";
import materialValidationBg from "@/assets/material-validation-bg.jpg";
import bioprocessingBg from "@/assets/bioprocessing-bg.jpg";

const ServicesLanding = () => {
  const services = [
    {
      id: "material-scouting",
      icon: Search,
      title: "Material Scouting",
      subtitle: "Discover the Perfect Sustainable Materials",
      description: "Our AI-powered material scouting service revolutionizes how businesses discover sustainable alternatives. Using advanced machine learning algorithms and a comprehensive global database, we identify materials that precisely match your technical requirements, sustainability goals, and budget constraints.",
      background: materialScoutingBg,
      features: [
        { icon: Globe, title: "Global Database Access", description: "Connect with sustainable material producers across Europe and beyond" },
        { icon: Zap, title: "AI-Powered Matching", description: "Advanced algorithms analyze thousands of material properties to find your perfect match" },
        { icon: TrendingUp, title: "Performance Analytics", description: "Detailed insights into material performance, sustainability metrics, and cost analysis" }
      ],
      benefits: [
        "Reduce material discovery time by 80%",
        "Access exclusive sustainable material sources",
        "Get detailed sustainability and compliance reports",
        "Connect directly with verified producers"
      ]
    },
    {
      id: "material-validation",
      icon: CheckCircle,
      title: "Material Validation",
      subtitle: "Ensure Quality & Performance Standards",
      description: "Our comprehensive validation service ensures that sustainable materials meet your exact quality, performance, and regulatory requirements. Through rigorous testing protocols and detailed analysis, we provide the confidence you need to adopt new materials.",
      background: materialValidationBg,
      features: [
        { icon: CheckCircle, title: "Quality Assurance", description: "Comprehensive testing against industry standards and custom requirements" },
        { icon: Leaf, title: "Sustainability Verification", description: "Independent verification of environmental claims and certifications" },
        { icon: Target, title: "Performance Testing", description: "Real-world application testing to validate material performance" }
      ],
      benefits: [
        "Eliminate risk in material adoption",
        "Ensure regulatory compliance",
        "Validate sustainability claims",
        "Optimize material selection decisions"
      ]
    },
    {
      id: "bioprocessing",
      icon: Zap,
      title: "Bioprocessing Optimization",
      subtitle: "Enhance Production Efficiency",
      description: "Transform your bioprocessing operations with our advanced optimization strategies. We combine cutting-edge biotechnology with process engineering to enhance the production of sustainable materials, reduce costs, and improve yield.",
      background: bioprocessingBg,
      features: [
        { icon: TrendingUp, title: "Process Optimization", description: "Data-driven improvements to maximize production efficiency" },
        { icon: Zap, title: "Resource Efficiency", description: "Reduce waste and energy consumption throughout your production process" },
        { icon: Globe, title: "Scalability Solutions", description: "Scale from laboratory to industrial production seamlessly" }
      ],
      benefits: [
        "Reduce production costs by up to 40%",
        "Improve material yield and consistency",
        "Minimize environmental footprint",
        "Accelerate time to market"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
                <Zap className="w-4 h-4" />
                Material AI Platform Services
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Smart Materials Discovery & <br />
                Material Informatics Solutions
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                End-to-end material AI platform services powered by advanced material informatics to discover, validate, and integrate smart materials into your business
              </p>
            </div>
          </div>
        </section>

        {/* Services Detail Sections */}
        {services.map((service, index) => (
          <section 
            key={service.id}
            id={service.id}
            className={index % 2 === 0 ? "py-24 bg-background" : "py-24 bg-muted/30"}
          >
            <div className="container mx-auto px-6 max-w-5xl">
              {/* Header with Icon and Title */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <service.icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-4">{service.title}</h2>
                <p className="text-xl text-muted-foreground">{service.subtitle}</p>
              </div>

              {/* Hero Image */}
              <Card className="overflow-hidden border-2 border-primary/20 shadow-xl mb-12">
                <div className="relative h-[300px]">
                  <img 
                    src={service.background} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                </div>
              </Card>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed text-center max-w-3xl mx-auto">
                {service.description}
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {service.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits */}
              <div className="bg-muted/50 rounded-xl p-8">
                <h4 className="font-bold text-foreground mb-6 text-xl text-center">Key Benefits</h4>
                <ul className="grid md:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-sustainable">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Material Strategy?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join leading companies leveraging AI-powered solutions for sustainable material innovation
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesLanding;
