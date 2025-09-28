import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Users } from "lucide-react";
import heroImage from "@/assets/hero-sustainable-materials.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Material Innovation Platform
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Connect. Innovate.{" "}
                <span className="bg-gradient-sustainable bg-clip-text text-transparent">
                  Sustain.
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                The AI-powered platform connecting sustainable material producers, innovators, 
                businesses, and educators across Europe and the UK. Transform your processes 
                with eco-friendly alternatives without compromising performance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Explore Platform
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Sustainable Materials</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">200+</p>
                  <p className="text-sm text-muted-foreground">Connected Companies</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-large">
              <img 
                src={heroImage} 
                alt="Sustainable materials innovation laboratory showcasing eco-friendly alternatives and bioprocessing technology" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-medium border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-sustainable rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">AI Matching</p>
                  <p className="text-sm text-muted-foreground">Smart material recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;