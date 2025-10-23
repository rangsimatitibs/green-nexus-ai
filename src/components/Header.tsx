import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/materialink-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="MateriaLink Logo" 
              className="w-10 h-10 object-contain"
            />
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
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              About
            </Link>
            <a 
              href="#contact" 
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-3">
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