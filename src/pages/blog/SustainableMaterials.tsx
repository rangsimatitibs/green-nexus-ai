import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SustainableMaterials = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 bg-gradient-innovation">
          <div className="container mx-auto px-6">
            <Link to="/blog">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <div className="max-w-4xl">
              <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                Best Practices
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Sustainable materials: Are we there yet?
              </h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">October 5, 2025</span>
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
                As we approach the end of 2025, it's time to take stock of where we stand in the journey toward truly sustainable materials. Have we made the progress we hoped for? What challenges remain? And what does the path forward look like?
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Progress So Far</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will evaluate the progress made in sustainable materials development, including key milestones achieved, regulatory changes, market adoption rates, and technological advancements that have brought us closer to sustainability goals.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Persistent Challenges</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will honestly assess the challenges that remain, including cost barriers, performance gaps, scalability issues, infrastructure limitations, and behavioral change requirements needed for widespread adoption.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Success Stories and Lessons Learned</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will highlight success stories from companies and industries that have successfully transitioned to sustainable materials, examining what worked, what didn't, and the key factors that enabled their success.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">The Path Forward</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will outline what needs to happen next to accelerate the transition to sustainable materials, including policy recommendations, technological priorities, collaboration opportunities, and realistic timelines for achieving sustainability goals.]
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">How You Can Contribute</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                [Content to be added - This section will provide actionable steps that businesses, researchers, and individuals can take to contribute to the sustainable materials transition, from adopting new materials to supporting innovation to advocating for policy change.]
              </p>

              <div className="mt-16 p-8 bg-gradient-innovation rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Be Part of the Solution
                </h3>
                <p className="text-white/90 mb-6">
                  Join the movement toward sustainable materials and connect with innovators driving real change.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Get Started Today
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

export default SustainableMaterials;
