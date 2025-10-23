import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle, Cog, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  companyName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  interestArea: z.string().min(1, { message: "Please select an interest area" }),
});

const services = [
  {
    icon: Search,
    title: "Material Scouting",
    features: [
      "Advanced AI matching",
      "Global material database",
      "Performance analytics"
    ]
  },
  {
    icon: CheckCircle,
    title: "Material Validation",
    features: [
      "Quality assurance",
      "Performance testing",
      "Compliance verification"
    ]
  },
  {
    icon: Cog,
    title: "Bioprocessing Optimization",
    features: [
      "Process optimization",
      "Efficiency improvements",
      "Cost reduction"
    ]
  },
  {
    icon: Target,
    title: "Application Matching",
    features: [
      "Smart recommendations",
      "Use case analysis",
      "Market insights"
    ]
  }
];

const SignUp = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      signupSchema.parse(formData);
      
      setIsSubmitting(true);

      const { error } = await supabase
        .from("waitlist_signups")
        .insert([
          {
            email: formData.email,
            full_name: formData.fullName,
            company_name: formData.companyName || null,
            phone: formData.phone || null,
            interest_area: formData.interestArea
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
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Join the Future of Sustainable Materials
            </h1>
            <p className="text-xl text-muted-foreground">
              Get early access to our platform and start your free trial when we launch.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {services.map((service) => (
              <Card key={service.title} className="border-2 hover:border-primary transition-smooth">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sign Up Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Request Early Access</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll notify you when the platform is ready.
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
                        <SelectItem value="material-validation">Material Validation</SelectItem>
                        <SelectItem value="bioprocessing-optimization">Bioprocessing Optimization</SelectItem>
                        <SelectItem value="application-matching">Application Matching</SelectItem>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
