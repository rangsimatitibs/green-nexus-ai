import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";
import alexPhoto from "@/assets/alex-joseph.jpg";
import rangsimatiti from "@/assets/rangsimatiti.jpg";
import holgerPhoto from "@/assets/dr-holger-warth.jpg";

const About = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const teamMembers = [
    {
      name: "Alex Joseph",
      role: "Co-Founder",
      shortBio: "A serial entrepreneur, with a history of turning AI concepts into scalable platforms.",
      fullBio: "Former CTO of Google-backed Dermie.AI, bringing deep knowledge of machine learning and a vision for transforming industries with intelligent systems.",
      email: "alex@materialink.ai",
      image: alexPhoto,
    },
    {
      name: "Rangsimatiti Binda Saichompoo",
      role: "Co-Founder",
      shortBio: "A sustainability alchemist, driven by the urgency of plastic pollution.",
      fullBio: "Combining scientific insights in sustainable materials & biomass valorization with an entrepreneurial spirit, turning innovation into impact for a cleaner future.",
      email: "rangsimatiti.b.s@gmail.com",
      image: rangsimatiti,
    },
    {
      name: "Dr. Holger Warth",
      role: "Technology & Innovation Advisor",
      shortBio: "Chief Technology and Innovation Officer at medmix, brings strategic leadership and innovation expertise to MateriaLink.",
      fullBio: "With a proven track record in global R&D across multiple countries, he has successfully reduced product development cycles and increased launches. His previous executive roles at Aliaxis, Hoya Vision Care, and Evonik, managing budgets up to several hundred million dollars, position him as a key advisor for our technology roadmap and market expansion.",
      email: null,
      image: holgerPhoto,
    },
  ];

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

          {/* Team Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-card border-border cursor-pointer transition-all duration-500 hover:shadow-elegant"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gradient-primary">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent opacity-100 group-hover:opacity-95 transition-opacity duration-500" />
                    
                    {/* Name & Role (Always Visible) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium text-sm">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Info Section */}
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      hoveredCard === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-6 space-y-4 bg-card/50 backdrop-blur-sm">
                      <p className="text-sm text-foreground leading-relaxed">
                        {member.shortBio}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {member.fullBio}
                      </p>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow transition-smooth"
                        >
                          <Mail size={16} />
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
