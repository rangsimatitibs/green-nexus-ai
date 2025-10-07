import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const coFounders = [
    {
      name: "Alex Joseph",
      role: "Co-Founder",
    },
    {
      name: "Rangsimatiti Binda Saichompoo",
      role: "Co-Founder",
    },
  ];

  const advisor = {
    name: "Dr. Holger Warth",
    role: "Technology & Innovation Advisor",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About MateriaLink
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pioneering sustainable material solutions through AI-powered innovation
            </p>
          </div>

          {/* Co-Founders Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              Co-Founders
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {coFounders.map((founder, index) => (
                <Card 
                  key={index} 
                  className="bg-card border-border hover:shadow-elegant transition-smooth"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {founder.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {founder.name}
                    </h3>
                    <p className="text-primary font-medium">{founder.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advisor Section */}
          <div>
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              Advisory Team
            </h2>
            <div className="max-w-md mx-auto">
              <Card className="bg-card border-border hover:shadow-elegant transition-smooth">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {advisor.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {advisor.name}
                  </h3>
                  <p className="text-primary font-medium">{advisor.role}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
