import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Platform from "@/components/Platform";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <Platform />
      </main>
      <Footer />
    </div>
  );
};

export default Index;