import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "The Future of Sustainable Materials in Manufacturing",
      description: "Exploring how AI and biotechnology are revolutionizing material science and creating new opportunities for sustainable production.",
      date: "March 15, 2024",
      category: "Innovation"
    },
    {
      title: "5 Steps to Validate Sustainable Materials for Your Business",
      description: "A comprehensive guide to ensuring sustainable materials meet your quality, performance, and compliance requirements.",
      date: "March 10, 2024",
      category: "Best Practices"
    },
    {
      title: "Bioprocessing Optimization: Reducing Costs While Going Green",
      description: "Learn how advanced bioprocessing techniques can lower production costs and environmental impact simultaneously.",
      date: "March 5, 2024",
      category: "Technology"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Insights & Updates
              </h1>
              <p className="text-xl text-white/90">
                Latest trends, best practices, and innovations in sustainable materials
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {post.category}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Coming Soon Message */}
            <div className="text-center mt-16">
              <p className="text-lg text-muted-foreground">
                More articles coming soon. Stay tuned for updates on sustainable material innovation.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
