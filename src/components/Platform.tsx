import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Brain, Globe, Recycle, TrendingUp, Users2 } from "lucide-react";

const Platform = () => {
  const benefits = [
    {
      icon: Network,
      title: "Connected Ecosystem",
      description: "Join a thriving network of material producers, innovators, and businesses across Europe and the UK."
    },
    {
      icon: Brain,
      title: "AI-Driven Insights",
      description: "Leverage advanced algorithms for personalized material recommendations and optimization strategies."
    },
    {
      icon: Globe,
      title: "Sustainable Focus",
      description: "Access recycled, bio-based, and innovative materials that reduce environmental impact."
    },
    {
      icon: Recycle,
      title: "Circular Economy",
      description: "Support circular economy principles by connecting waste streams with material needs."
    },
    {
      icon: TrendingUp,
      title: "Performance Guaranteed",
      description: "Maintain or enhance product performance while transitioning to sustainable alternatives."
    },
    {
      icon: Users2,
      title: "Collaborative Innovation",
      description: "Connect with startups, SMEs, and established companies driving material innovation."
    }
  ];

  return (
    <section id="platform" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                <Brain className="w-4 h-4" />
                Intelligent Platform
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Empowering{" "}
                <span className="bg-gradient-innovation bg-clip-text text-transparent">
                  Sustainable
                </span>{" "}
                Innovation
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                MateriaLink bridges the gap between sustainable material innovation and practical implementation. 
                Our platform supports Europe and UK's emerging innovative startups and middle-sized companies 
                in their journey toward sustainability.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Eco-Friendly Alternatives</h3>
                  <p className="text-muted-foreground">Discover materials that reduce environmental impact without compromising on performance or efficiency.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Innovation Network</h3>
                  <p className="text-muted-foreground">Connect with pioneers in sustainable materials and cutting-edge bioprocessing technologies.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-earth rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-earth-foreground rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Educational Resources</h3>
                  <p className="text-muted-foreground">Access comprehensive educational materials and best practices for sustainable material integration.</p>
                </div>
              </div>
            </div>
            
            <Button variant="innovation" size="lg" className="group">
              Join the Platform
              <Network className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-sustainable rounded-lg flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                      <benefit.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;