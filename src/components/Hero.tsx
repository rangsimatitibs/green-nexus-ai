import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Users } from "lucide-react";
import greenPlantsBg from "@/assets/green-plants-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center pt-20 overflow-hidden">
      {/* Sustainable fabrics background */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        <img 
          src={greenPlantsBg} 
          alt="" 
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium border border-white/20">
            <Sparkles className="w-4 h-4" />
            Smart Materials AI Platform
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] tracking-tight">
            Smart Materials Discovery{" "}
            <span className="block mt-2 bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-white leading-relaxed max-w-3xl mx-auto font-light">
            Leading material AI platform connecting sustainable material producers, innovators, and businesses through advanced material informatics.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 py-6 text-lg font-semibold">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Leaf className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-white/80">Sustainable Materials</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">200+</p>
                <p className="text-sm text-white/80">Connected Companies</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">AI-Powered</p>
                <p className="text-sm text-white/80">Smart Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-primary-glow/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;