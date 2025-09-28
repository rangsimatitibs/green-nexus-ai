import { Button } from "@/components/ui/button";
import { Leaf, Network, Brain } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MateriaLink</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Sustainability</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Services
            </a>
            <a href="#platform" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Platform
            </a>
            <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              About
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;