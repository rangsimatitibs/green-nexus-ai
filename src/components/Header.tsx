import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Home
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                    Platform
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-popover">
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/platform/material-scouting"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Material Scouting</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Discover sustainable materials with AI-powered search
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/platform/application-matching"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Application Matching</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Match materials to your specific applications
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/platform/property-prediction"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Property Prediction</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Predict material properties with machine learning
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/platform/process-optimization"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">Process Optimization</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Optimize bioprocessing for maximum efficiency
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Blog
            </Link>

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
            <Link to="/signup">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;