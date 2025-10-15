import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Users } from "lucide-react";
import materialBackground from "@/assets/material-background.jpg";
import FloatingShapes from "./FloatingShapes";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center pt-20 overflow-hidden">
      {/* 3D Floating Shapes Background */}
      <FloatingShapes />
      
      {/* Material texture background */}
      <div className="absolute inset-0 pointer-events-none z-[5] opacity-30">
        <img 
          src={materialBackground} 
          alt="" 
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Gradient overlay to blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary))]/90 via-[hsl(var(--primary))]/85 to-[hsl(var(--primary))]/90 z-[6] pointer-events-none"></div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--primary))]/5 to-transparent z-[6] pointer-events-none"></div>

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium border border-white/20">
            <Sparkles className="w-4 h-4" />
            AI-Powered Material Innovation
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] tracking-tight">
            Every material decision{" "}
            <span className="block mt-2 bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              matters.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-light">
            Connect sustainable material producers, innovators, and businesses across Europe. 
            Transform your processes with AI-powered alternatives.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 py-6 text-lg font-semibold">
              Explore Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg">
              Watch Demo
            </Button>
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