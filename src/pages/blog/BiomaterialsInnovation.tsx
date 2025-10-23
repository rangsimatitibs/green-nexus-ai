import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BiomaterialsInnovation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 bg-gradient-sustainable">
          <div className="container mx-auto px-6">
            <Link to="/blog">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <div className="max-w-4xl">
              <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                Technology
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Biomaterials innovation in 2025
              </h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">October 10, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">MateriaLink Team</span>
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
                The biomaterials landscape is evolving rapidly in 2025, with breakthrough innovations transforming industries from packaging to medical devices. Discover the cutting-edge developments shaping the future of sustainable materials.
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">The State of Biomaterials in 2025</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will provide an overview of the current biomaterials landscape, key players, market trends, and recent technological breakthroughs that are driving the industry forward.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Breakthrough Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will highlight specific innovations such as mycelium-based materials, algae-derived polymers, bacterial cellulose, and other emerging biomaterial technologies that are gaining commercial traction.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Industry Applications and Case Studies</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will showcase real-world applications of biomaterials across different sectors, including successful case studies, performance metrics, and lessons learned from early adopters.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Challenges and Opportunities</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will discuss the current challenges facing biomaterials adoption, including scalability, cost competitiveness, and performance requirements, as well as the opportunities for innovation and market growth.]
              </p>

              <div className="mt-16 p-8 bg-gradient-sustainable rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Explore Biomaterial Solutions
                </h3>
                <p className="text-white/90 mb-6">
                  Connect with innovative biomaterial producers and discover sustainable alternatives for your products.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Join MateriaLink
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

export default BiomaterialsInnovation;
