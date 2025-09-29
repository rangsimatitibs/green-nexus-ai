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
            
            <div className="space-y-6 relative">
              {/* Floating Material Elements with Linking Animation */}
              <div className="absolute -top-8 -right-4 w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full opacity-80 animate-pulse shadow-lg hover-scale"></div>
              <div className="absolute -top-2 right-20 w-8 h-8 bg-gradient-to-br from-primary to-accent transform rotate-45 opacity-70 shadow-md animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute top-12 -left-8 w-12 h-12 bg-gradient-to-br from-primary-glow to-accent rounded-lg transform rotate-12 opacity-60 shadow-md animate-[bounce_3s_ease-in-out_infinite]"></div>
              <div className="absolute top-20 right-8 w-6 h-6 bg-gradient-to-br from-accent to-primary-glow rounded-full opacity-50 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              
              {/* Connecting Lines/Paths */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2"/>
                  </linearGradient>
                </defs>
                <path 
                  d="M 80 40 Q 200 80 320 60" 
                  stroke="url(#linkGradient)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-[fade-in_2s_ease-in-out_infinite_alternate]"
                />
                <path 
                  d="M 60 120 Q 150 100 240 140" 
                  stroke="url(#linkGradient)" 
                  strokeWidth="1.5" 
                  fill="none"
                  className="animate-[fade-in_3s_ease-in-out_infinite_alternate]"
                />
              </svg>
              
              {/* Orbiting Elements */}
              <div className="absolute top-8 right-12 w-4 h-4 bg-gradient-to-br from-primary to-accent rounded-full opacity-60 animate-[spin_6s_linear_infinite] origin-[2rem_2rem]"></div>
              <div className="absolute top-4 right-16 w-3 h-3 bg-gradient-to-br from-accent to-primary-glow rounded-full opacity-40 animate-[spin_10s_linear_infinite_reverse] origin-[3rem_3rem]"></div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight relative z-10">
                Connect. Innovate.{" "}
                <span className="bg-gradient-sustainable bg-clip-text text-transparent relative">
                  Sustain.
                  {/* Inline geometric accent with enhanced animation */}
                  <div className="absolute -top-4 -right-6 w-8 h-8 bg-gradient-to-br from-accent to-primary opacity-40 rounded-full animate-[bounce_2s_ease-in-out_infinite] hover:animate-[spin_1s_linear_infinite]"></div>
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