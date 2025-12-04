import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface PremiumGateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const PremiumGate = ({ title, description, children }: PremiumGateProps) => {
  return (
    <div className="relative">
      {/* Blurred background content */}
      {children && (
        <div className="blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Premium overlay */}
      <div className={`${children ? 'absolute inset-0' : ''} flex items-center justify-center p-8`}>
        <Card className="p-8 max-w-md text-center bg-background/95 backdrop-blur border-primary/20 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
          <Link to="/signup">
            <Button variant="hero" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default PremiumGate;
