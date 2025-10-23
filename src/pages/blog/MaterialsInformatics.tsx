import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import authorPhoto from "@/assets/rangsimatiti.jpg";
import heroImage from "@/assets/blog-materials-informatics.jpg";

const MaterialsInformatics = () => {
  const tags = [
    { name: "Innovation", color: "bg-primary" },
    { name: "AI & Data Science", color: "bg-accent" },
    { name: "Materials Science", color: "bg-[hsl(270,60%,55%)]" }
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Materials Informatics" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <Link to="/blog">
              <Button variant="ghost" className="mb-6 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className={`${tag.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                What is materials informatics and why it matters?
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={authorPhoto} 
                    alt="Rangsimatiti Binda Saichompoo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <User className="w-4 h-4" />
                      Rangsimatiti Binda Saichompoo
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      October 15, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <article className="max-w-3xl mx-auto prose prose-lg">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Materials informatics is revolutionizing how we discover, develop, and deploy sustainable materials across industries. This emerging field combines data science, artificial intelligence, and materials science to accelerate innovation.
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Understanding Materials Informatics</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will explore the fundamentals of materials informatics, including data-driven approaches to material discovery, machine learning applications, and the integration of computational methods with traditional materials science.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Why It Matters for Sustainability</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will discuss the critical role of materials informatics in accelerating the transition to sustainable materials, reducing development time and costs, and enabling data-driven decision making for environmental impact.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Real-World Applications</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will showcase practical applications across industries, from packaging to automotive, and demonstrate how materials informatics is being used to solve real-world challenges.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">The Future of Materials Innovation</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will look ahead to emerging trends, future possibilities, and how materials informatics will continue to shape sustainable material development in the coming years.]
              </p>

              <div className="mt-16 p-8 bg-gradient-primary rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Leverage Materials Informatics?
                </h3>
                <p className="text-white/90 mb-6">
                  Join MateriaLink to access AI-powered material discovery and validation services.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MaterialsInformatics;
