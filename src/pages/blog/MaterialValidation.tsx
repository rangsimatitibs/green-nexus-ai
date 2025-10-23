import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import authorPhoto from "@/assets/rangsimatiti.jpg";
import heroImage from "@/assets/blog-material-validation.jpg";

const MaterialValidation = () => {
  const tags = [
    { name: "Best Practices", color: "bg-secondary" },
    { name: "Sustainability", color: "bg-success" },
    { name: "Quality Control", color: "bg-earth" }
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
              alt="Material Validation" 
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
                5 Steps to Validate Sustainable Materials for Your Business
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
                      October 20, 2025
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
                Transitioning to sustainable materials requires careful validation to ensure they meet your quality, performance, and regulatory requirements. This comprehensive guide outlines the essential steps for successful material validation.
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Step 1: Define Your Requirements</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will cover how to establish clear technical specifications, performance benchmarks, sustainability criteria, regulatory requirements, and cost constraints for your material selection process.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Step 2: Source and Screen Candidates</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will discuss strategies for identifying potential sustainable materials, preliminary screening criteria, working with suppliers, and using databases and networks to find suitable candidates.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Step 3: Conduct Laboratory Testing</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will outline the essential laboratory tests, including physical properties, chemical composition, durability, and performance under various conditions, plus how to interpret test results.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Step 4: Run Pilot Production</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will explain the importance of pilot-scale testing, how to design pilot runs, what to measure and monitor, and how to identify and address potential production challenges early.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Step 5: Verify Compliance and Scale</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will cover final compliance verification, certification processes, scaling considerations, supply chain validation, and preparing for full commercial production.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Common Pitfalls to Avoid</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will highlight common mistakes in the validation process, how to avoid them, and best practices learned from successful material transitions.]
              </p>

              <div className="mt-16 p-8 bg-gradient-sustainable rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Need Help Validating Materials?
                </h3>
                <p className="text-white/90 mb-6">
                  MateriaLink offers comprehensive material validation services to ensure your sustainable materials meet all requirements.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Get Expert Support
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

export default MaterialValidation;
