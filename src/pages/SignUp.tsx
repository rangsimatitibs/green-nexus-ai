import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Cog, MessageSquare, Sparkles, FlaskConical, Factory, Crown, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { z } from "zod";
import materialScoutingBg from "@/assets/material-scouting-bg.jpg";
import materialValidationBg from "@/assets/material-validation-bg.jpg";
import bioprocessingBg from "@/assets/bioprocessing-bg.jpg";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  companyName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  interestArea: z.string().min(1, { message: "Please select an interest area" }),
  selectedTier: z.string().optional(),
});

const tierDisplayNames: Record<string, { name: string; icon: React.ReactNode; color: string; price: { monthly: number; annual: number } }> = {
  researcher_lite: { 
    name: "Researcher Lite", 
    icon: <FlaskConical className="h-5 w-5" />, 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    price: { monthly: 29, annual: 290 }
  },
  researcher_premium: { 
    name: "Researcher Premium", 
    icon: <Star className="h-5 w-5" />, 
    color: "bg-blue-600/10 text-blue-600 border-blue-600/20",
    price: { monthly: 49, annual: 490 }
  },
  industry_lite: { 
    name: "Industry Lite", 
    icon: <Factory className="h-5 w-5" />, 
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    price: { monthly: 149, annual: 1490 }
  },
  industry_premium: { 
    name: "Industry Premium", 
    icon: <Crown className="h-5 w-5" />, 
    color: "bg-amber-600/10 text-amber-600 border-amber-600/20",
    price: { monthly: 249, annual: 2490 }
  },
};

const services = [
  {
    icon: Search,
    title: "Material Scouting",
    features: [
      "Advanced AI matching",
      "Global material database",
      "Performance analytics"
    ],
    backgroundImage: materialScoutingBg
  },
  {
    icon: Cog,
    title: "Researcher's Tool",
    features: [
      "Property prediction",
      "Lab recipes database",
      "Material library"
    ],
    backgroundImage: materialValidationBg
  },
  {
    icon: Cog,
    title: "Bioprocess Optimization",
    features: [
      "Process optimization",
      "Efficiency improvements",
      "Cost reduction"
    ],
    backgroundImage: bioprocessingBg
  }
];

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const selectedTier = searchParams.get('tier');
  const billingPeriod = searchParams.get('billing') as 'monthly' | 'annual' | null;
  
  const tierInfo = selectedTier ? tierDisplayNames[selectedTier] : null;
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    companyName: "",
    phone: "",
    interestArea: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-select interest area based on tier
  useEffect(() => {
    if (selectedTier && !formData.interestArea) {
      const isResearcherTier = selectedTier.includes('researcher');
      const isIndustryTier = selectedTier.includes('industry');
      if (isResearcherTier) {
        setFormData(prev => ({ ...prev, interestArea: 'researchers-tool' }));
      } else if (isIndustryTier) {
        setFormData(prev => ({ ...prev, interestArea: 'all-services' }));
      }
    }
  }, [selectedTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      signupSchema.parse({ ...formData, selectedTier: selectedTier || undefined });
      
      setIsSubmitting(true);

      // Build the interest area with tier info
      const interestWithTier = selectedTier 
        ? `${formData.interestArea} (Selected: ${tierInfo?.name || selectedTier} - ${billingPeriod || 'monthly'})`
        : formData.interestArea;

      const { error } = await supabase
        .from("waitlist_signups")
        .insert([
          {
            email: formData.email,
            full_name: formData.fullName,
            company_name: formData.companyName || null,
            phone: formData.phone || null,
            interest_area: interestWithTier
          }
        ]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You've been added to our waitlist. We'll be in touch soon!",
        });
        
        // Reset form
        setFormData({
          email: "",
          fullName: "",
          companyName: "",
          phone: "",
          interestArea: ""
        });
        
        // Redirect to home after 2 seconds
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Selected Tier Banner */}
          {tierInfo && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className={`p-4 rounded-xl border-2 ${tierInfo.color} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tierInfo.color}`}>
                    {tierInfo.icon}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {tierInfo.name}
                      <Badge variant="secondary" className="text-xs">
                        Selected Plan
                      </Badge>
                    </p>
                    <p className="text-sm opacity-80">
                      ${billingPeriod === 'annual' ? tierInfo.price.annual : tierInfo.price.monthly}
                      /{billingPeriod === 'annual' ? 'year' : 'month'}
                    </p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 opacity-60" />
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {tierInfo ? "Request Early Access" : "Join the Future of Sustainable Materials"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {tierInfo 
                ? `You've selected the ${tierInfo.name} plan. Join our waitlist and we'll notify you when checkout is ready.`
                : "Get early access to our platform and start your free trial when we launch."
              }
            </p>
          </div>

          {/* Sign Up Form - Now First */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card className={`border-2 ${tierInfo ? 'border-primary/30' : ''}`}>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {tierInfo ? `Join Waitlist for ${tierInfo.name}` : "Request Early Access"}
                </CardTitle>
                <CardDescription>
                  {tierInfo 
                    ? "Fill out the form below and we'll notify you as soon as checkout is available for your selected plan."
                    : "Fill out the form below and we'll notify you when the platform is ready."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestArea">Primary Interest *</Label>
                    <Select
                      value={formData.interestArea}
                      onValueChange={(value) => setFormData({ ...formData, interestArea: value })}
                      required
                    >
                      <SelectTrigger id="interestArea">
                        <SelectValue placeholder="Select your primary interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material-scouting">Material Scouting</SelectItem>
                        <SelectItem value="researchers-tool">Researcher's Tool</SelectItem>
                        <SelectItem value="bioprocess-optimization">Bioprocess Optimization</SelectItem>
                        <SelectItem value="all-services">All Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Join Waitlist"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    By signing up, you agree to receive updates about MateriaLink.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {services.map((service) => (
              <Card key={service.title} className="border-2 hover:border-primary transition-smooth overflow-hidden relative group">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={service.backgroundImage} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                </div>
                
                {/* Content */}
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/90">
                        <span className="text-white mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TypeForm Survey Section */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="p-8 bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl border-2 border-accent/20">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Help Us Improve MateriaLink
              </h3>
              <p className="text-muted-foreground mb-6">
                Share your thoughts and needs to help us build a better platform for sustainable materials innovation.
              </p>
              <a 
                href="https://form.typeform.com/to/MBPg47eq" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-accent to-secondary hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Your Opinion Matters!
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
