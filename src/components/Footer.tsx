import { Linkedin, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/materialink-logo.png";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo & Brand */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="MateriaLink Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-foreground">MateriaLink</h2>
                <p className="text-xs text-muted-foreground">AI-Powered Sustainability</p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Locations</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Paris, France</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>London, UK</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:alex@materialink.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                <Mail className="w-4 h-4" />
                <span>alex@materialink.com</span>
              </a>
              <a
                href="https://www.linkedin.com/company/materia-link/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4" />
                  Follow on LinkedIn
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MateriaLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
