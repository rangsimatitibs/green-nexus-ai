import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Users } from "lucide-react";
import heroImage from "@/assets/hero-sustainable-materials.jpg";
import FloatingShapes from "./FloatingShapes";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center pt-20 overflow-hidden">
      {/* 3D Floating Shapes Background */}
      <FloatingShapes />

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-primary px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
            <Sparkles className="w-4 h-4" />
            AI-Powered Material Innovation
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.05] tracking-tight">
            Every material decision{" "}
            <span className="block mt-2 text-primary">
              matters.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto font-light">
            Connect sustainable material producers, innovators, and businesses across Europe. 
            Transform your processes with AI-powered alternatives.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl px-8 py-6 text-lg font-semibold rounded-full">
              Explore Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-lg rounded-full">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Sustainable Materials</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">200+</p>
                <p className="text-sm text-muted-foreground">Connected Companies</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">AI-Powered</p>
                <p className="text-sm text-muted-foreground">Smart Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;