import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const posts = [
    {
      title: "What is materials informatics and why it matters?",
      description: "Exploring how AI and data science are revolutionizing material discovery and creating new opportunities for sustainable innovation.",
      date: "October 15, 2025",
      category: "Innovation",
      link: "/blog/materials-informatics"
    },
    {
      title: "Biomaterials innovation in 2025",
      description: "Discover the cutting-edge developments in biomaterials that are transforming industries from packaging to medical devices.",
      date: "October 10, 2025",
      category: "Technology",
      link: "/blog/biomaterials-innovation"
    },
    {
      title: "Sustainable materials: Are we there yet?",
      description: "A comprehensive look at the progress, challenges, and opportunities in the transition to truly sustainable materials.",
      date: "October 5, 2025",
      category: "Best Practices",
      link: "/blog/sustainable-materials"
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
                <Link key={index} to={post.link}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
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
                </Link>
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
