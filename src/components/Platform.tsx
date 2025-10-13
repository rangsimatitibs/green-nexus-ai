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
    <section id="platform" className="py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-5 py-2.5 rounded-full text-sm font-semibold">
                <Brain className="w-4 h-4" />
                Intelligent Platform
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                Empowering{" "}
                <span className="bg-gradient-innovation bg-clip-text text-transparent">
                  Sustainable
                </span>{" "}
                Innovation
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                MateriaLink bridges the gap between sustainable material innovation and practical implementation, 
                supporting Europe and UK's emerging startups and middle-sized companies.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gradient-sustainable rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Eco-Friendly Alternatives</h3>
                  <p className="text-muted-foreground leading-relaxed">Discover materials that reduce environmental impact without compromising on performance or efficiency.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Innovation Network</h3>
                  <p className="text-muted-foreground leading-relaxed">Connect with pioneers in sustainable materials and cutting-edge bioprocessing technologies.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Educational Resources</h3>
                  <p className="text-muted-foreground leading-relaxed">Access comprehensive educational materials and best practices for sustainable material integration.</p>
                </div>
              </div>
            </div>
            
            <Button size="lg" className="bg-gradient-innovation text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold group">
              Join the Platform
              <Network className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-primary/20 bg-card hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="space-y-5">
                    <div className="w-14 h-14 bg-gradient-sustainable rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-glow transition-all duration-500">
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors">
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