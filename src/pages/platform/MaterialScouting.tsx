import { Search, Database, Target, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Factory, Scale, Lightbulb, Award, DollarSign, TrendingUp, Atom } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const MaterialScouting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "suppliers">("overview");

  const sampleMaterials = [
    {
      id: "pla",
      name: "Polylactic Acid (PLA)",
      category: "Biopolymer",
      chemicalFormula: "(C₃H₄O₂)ₙ",
      chemicalStructure: "[-O-CH(CH₃)-CO-]ₙ",
      properties: {
        tensileStrength: "50-70 MPa",
        meltingPoint: "150-160°C",
        density: "1.24 g/cm³",
        biodegradability: "Yes (6-24 months)",
        renewable: "100% bio-based"
      },
      sustainability: {
        score: 92,
        breakdown: {
          renewable: 95,
          carbonFootprint: 90,
          biodegradability: 95,
          toxicity: 88
        },
        calculation: "Weighted average: Renewable (30%), Carbon Footprint (30%), Biodegradability (25%), Toxicity (15%)"
      },
      applications: ["Packaging", "3D Printing", "Medical Implants"],
      regulations: ["FDA Approved", "EU 10/2011", "ASTM D6400"],
      scale: "Industrial (>10,000 tons/year)",
      innovation: "High - Continuous development in additives and blends",
      suppliers: [
        {
          company: "NatureWorks LLC",
          country: "🇺🇸 USA",
          logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "65 MPa",
            meltingPoint: "155°C",
            additives: "None (Pure PLA)"
          },
          pricing: "$2.50-3.00/kg",
          minOrder: "1000 kg",
          leadTime: "4-6 weeks",
          certifications: ["FDA", "EU", "ISO 9001"]
        },
        {
          company: "Total Corbion PLA",
          country: "🇳🇱 Netherlands",
          logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "60 MPa",
            meltingPoint: "158°C",
            additives: "Impact modifiers"
          },
          pricing: "$2.80-3.20/kg",
          minOrder: "500 kg",
          leadTime: "3-5 weeks",
          certifications: ["FDA", "EU", "ASTM"]
        },
        {
          company: "Futerro",
          country: "🇧🇪 Belgium",
          logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "55 MPa",
            meltingPoint: "152°C",
            additives: "Plasticizers"
          },
          pricing: "$2.40-2.90/kg",
          minOrder: "2000 kg",
          leadTime: "5-7 weeks",
          certifications: ["EU", "ASTM"]
        }
      ]
    },
    {
      id: "cnf",
      name: "Cellulose Nanofibers",
      category: "Nanocellulose",
      chemicalFormula: "(C₆H₁₀O₅)ₙ",
      chemicalStructure: "[-C₆H₇O₂(OH)₃-]ₙ (β-1,4-glycosidic bonds)",
      properties: {
        tensileStrength: "200-300 MPa",
        modulus: "130-140 GPa",
        density: "1.5 g/cm³",
        biodegradability: "Yes (3-12 months)",
        renewable: "100% bio-based"
      },
      sustainability: {
        score: 95,
        breakdown: {
          renewable: 100,
          carbonFootprint: 92,
          biodegradability: 95,
          toxicity: 93
        },
        calculation: "Weighted average: Renewable (30%), Carbon Footprint (30%), Biodegradability (25%), Toxicity (15%)"
      },
      applications: ["Composites", "Packaging", "Coatings"],
      regulations: ["FDA GRAS", "EU Novel Food", "ASTM E2456"],
      scale: "Pilot/Commercial (100-5,000 tons/year)",
      innovation: "Very High - Emerging material with novel applications",
      suppliers: [
        {
          company: "CelluComp",
          country: "🇬🇧 UK",
          logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "280 MPa",
            modulus: "135 GPa",
            additives: "None"
          },
          pricing: "$15-20/kg",
          minOrder: "50 kg",
          leadTime: "2-4 weeks",
          certifications: ["FDA GRAS", "EU"]
        },
        {
          company: "Nippon Paper",
          country: "🇯🇵 Japan",
          logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "250 MPa",
            modulus: "140 GPa",
            additives: "Dispersants"
          },
          pricing: "$18-25/kg",
          minOrder: "100 kg",
          leadTime: "3-5 weeks",
          certifications: ["FDA", "ASTM"]
        }
      ]
    },
    {
      id: "mycelium",
      name: "Mycelium-Based Composite",
      category: "Fungal Material",
      chemicalFormula: "Complex biopolymer matrix",
      chemicalStructure: "Chitin (C₈H₁₃NO₅)ₙ + β-glucans + proteins",
      properties: {
        tensileStrength: "0.5-2 MPa",
        density: "0.1-0.2 g/cm³",
        compressiveStrength: "30-70 kPa",
        biodegradability: "Yes (1-6 months)",
        renewable: "100% bio-based"
      },
      sustainability: {
        score: 98,
        breakdown: {
          renewable: 100,
          carbonFootprint: 98,
          biodegradability: 100,
          toxicity: 95
        },
        calculation: "Weighted average: Renewable (30%), Carbon Footprint (30%), Biodegradability (25%), Toxicity (15%)"
      },
      applications: ["Packaging", "Insulation", "Furniture"],
      regulations: ["ASTM D6400", "EN 13432", "USDA BioPreferred"],
      scale: "Small/Pilot (10-500 tons/year)",
      innovation: "Very High - Revolutionary carbon-negative material",
      suppliers: [
        {
          company: "Ecovative Design",
          country: "🇺🇸 USA",
          logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1585571430840-52abb4c2beaf?w=400&h=300&fit=crop",
          properties: {
            density: "0.15 g/cm³",
            compressiveStrength: "50 kPa",
            additives: "Agricultural waste substrate"
          },
          pricing: "$8-12/kg",
          minOrder: "25 kg",
          leadTime: "4-8 weeks",
          certifications: ["ASTM", "USDA"]
        },
        {
          company: "Magical Mushroom",
          country: "🇩🇪 Germany",
          logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1564720595928-7cd6bb96c616?w=400&h=300&fit=crop",
          properties: {
            density: "0.18 g/cm³",
            compressiveStrength: "60 kPa",
            additives: "Hemp fibers"
          },
          pricing: "$10-15/kg",
          minOrder: "50 kg",
          leadTime: "5-10 weeks",
          certifications: ["EN 13432"]
        }
      ]
    },
    {
      id: "biope",
      name: "Bio-based Polyethylene",
      category: "Bio-plastic",
      chemicalFormula: "(C₂H₄)ₙ",
      chemicalStructure: "[-CH₂-CH₂-]ₙ",
      properties: {
        tensileStrength: "20-30 MPa",
        density: "0.94-0.96 g/cm³",
        meltingPoint: "120-130°C",
        biodegradability: "No (recyclable)",
        renewable: "Bio-based (from sugarcane)"
      },
      sustainability: {
        score: 85,
        breakdown: {
          renewable: 90,
          carbonFootprint: 85,
          biodegradability: 70,
          toxicity: 90
        },
        calculation: "Weighted average: Renewable (30%), Carbon Footprint (30%), Biodegradability (25%), Toxicity (15%)"
      },
      applications: ["Bottles", "Films", "Consumer Goods"],
      regulations: ["FDA 21 CFR", "EU 10/2011", "ASTM D6866"],
      scale: "Industrial (>50,000 tons/year)",
      innovation: "Medium - Established drop-in replacement",
      suppliers: [
        {
          company: "Braskem",
          country: "🇧🇷 Brazil",
          logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "28 MPa",
            density: "0.95 g/cm³",
            additives: "UV stabilizers"
          },
          pricing: "$1.80-2.20/kg",
          minOrder: "5000 kg",
          leadTime: "6-8 weeks",
          certifications: ["FDA", "EU", "ASTM"]
        },
        {
          company: "Dow Chemical",
          country: "🇺🇸 USA",
          logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
          productImage: "https://images.unsplash.com/photo-1610056494052-6a4f83cc8d2f?w=400&h=300&fit=crop",
          properties: {
            tensileStrength: "25 MPa",
            density: "0.94 g/cm³",
            additives: "Antioxidants"
          },
          pricing: "$1.90-2.30/kg",
          minOrder: "10000 kg",
          leadTime: "4-6 weeks",
          certifications: ["FDA", "ASTM"]
        }
      ]
    }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setExpandedMaterial(null);
    setViewMode("overview");
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = sampleMaterials.filter(mat => 
        mat.name.toLowerCase().includes(query) ||
        mat.category.toLowerCase().includes(query) ||
        Object.values(mat.properties).some(p => p.toLowerCase().includes(query)) ||
        mat.applications.some(a => a.toLowerCase().includes(query)) ||
        mat.regulations.some(r => r.toLowerCase().includes(query)) ||
        mat.suppliers.some(s => s.company.toLowerCase().includes(query))
      );
      setSearchResults(filtered.length > 0 ? filtered : sampleMaterials);
      setIsSearching(false);
    }, 1000);
  };

  const capabilities = [
    {
      icon: Database,
      title: "Comprehensive Database Access",
      description: "Search across millions of materials from scientific literature, patents, and material databases"
    },
    {
      icon: Target,
      title: "Property-Based Filtering",
      description: "Define target properties like conductivity, strength, or biodegradability to find exact matches"
    },
    {
      icon: Search,
      title: "AI-Powered Discovery",
      description: "Machine learning algorithms identify novel materials you might have missed"
    }
  ];

  const useCases = [
    "Finding sustainable alternatives to traditional plastics",
    "Discovering materials with specific mechanical properties",
    "Identifying biodegradable materials for packaging applications",
    "Scouting materials for energy storage applications",
    "Finding bio-based alternatives to synthetic materials"
  ];

  const workflow = [
    { step: 1, title: "Define Requirements", description: "Specify your material property requirements and constraints" },
    { step: 2, title: "AI Search", description: "Our algorithms scan databases and literature for matching materials" },
    { step: 3, title: "Results Ranking", description: "Materials ranked by relevance, availability, and sustainability" },
    { step: 4, title: "Detailed Reports", description: "Get comprehensive data sheets with properties, suppliers, and references" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Material Scouting
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover sustainable materials faster with AI-powered search across global databases. 
              Find the perfect material for your application from millions of options.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Start Scouting Materials
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Try Material Scouting Now
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search our sample database to see how AI-powered material discovery works
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Search by material name, property, or application (e.g., 'biodegradable', 'packaging', 'high strength')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="min-w-[120px]"
                >
                  {isSearching ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-semibold text-foreground">
                    Found {searchResults.length} Materials
                  </h3>
                  {searchResults.map((material) => (
                    <Card key={material.id} className="overflow-hidden">
                      {/* Main Material Card */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-foreground">
                                {material.name}
                              </h4>
                              <Badge variant="secondary">{material.category}</Badge>
                            </div>
                            <div className="mb-3">
                              <Card className="p-3 bg-muted/50 inline-block">
                                <div className="flex items-center gap-2 text-sm">
                                  <Atom className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="font-medium text-foreground">Formula: </span>
                                    <span className="text-muted-foreground">{material.chemicalFormula}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Structure: {material.chemicalStructure}
                                </div>
                              </Card>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="gap-1">
                                <Scale className="h-3 w-3" />
                                {material.scale}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Lightbulb className="h-3 w-3" />
                                {material.innovation}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Factory className="h-3 w-3" />
                                {material.suppliers.length} Suppliers
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Sustainability</div>
                            <div className="text-3xl font-bold text-primary">{material.sustainability.score}%</div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-medium text-foreground mb-2">Applications:</div>
                            <div className="flex flex-wrap gap-2">
                              {material.applications.map((app: string, i: number) => (
                                <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20">
                                  {app}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground mb-2">Regulations:</div>
                            <div className="flex flex-wrap gap-2">
                              {material.regulations.map((reg: string, i: number) => (
                                <Badge key={i} variant="outline" className="gap-1">
                                  <Award className="h-3 w-3" />
                                  {reg}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setExpandedMaterial(expandedMaterial === material.id ? null : material.id)}
                          variant="outline"
                          className="w-full"
                        >
                          {expandedMaterial === material.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              View Detailed Properties & Suppliers
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {expandedMaterial === material.id && (
                        <div className="border-t bg-muted/30">
                          <div className="p-6 space-y-6">
                            {/* View Toggle */}
                            <div className="flex gap-2">
                              <Button
                                variant={viewMode === "overview" ? "default" : "outline"}
                                onClick={() => setViewMode("overview")}
                                size="sm"
                              >
                                Material Properties
                              </Button>
                              <Button
                                variant={viewMode === "suppliers" ? "default" : "outline"}
                                onClick={() => setViewMode("suppliers")}
                                size="sm"
                              >
                                <Factory className="h-4 w-4 mr-2" />
                                Find Suppliers ({material.suppliers.length})
                              </Button>
                            </div>

                            {viewMode === "overview" ? (
                              <>
                                {/* Properties Grid */}
                                <div>
                                  <h5 className="text-lg font-semibold text-foreground mb-4">Material Properties</h5>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(material.properties).map(([key, value]) => (
                                      <Card key={key} className="p-4">
                                        <div className="text-sm text-muted-foreground mb-1 capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-lg font-semibold text-foreground">{String(value)}</div>
                                      </Card>
                                    ))}
                                  </div>
                                </div>

                                {/* Sustainability Breakdown */}
                                <div>
                                  <h5 className="text-lg font-semibold text-foreground mb-4">
                                    Sustainability Score Breakdown
                                  </h5>
                                  <Card className="p-4">
                                    <div className="space-y-4">
                                      {Object.entries(material.sustainability.breakdown).map(([key, value]) => (
                                        <div key={key}>
                                          <div className="flex justify-between text-sm mb-2">
                                            <span className="text-foreground capitalize">
                                              {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="font-semibold text-primary">{String(value)}%</span>
                                          </div>
                                          <Progress value={value as number} className="h-2" />
                                        </div>
                                      ))}
                                      <Separator className="my-3" />
                                      <div className="text-xs text-muted-foreground">
                                        <strong>Calculation:</strong> {material.sustainability.calculation}
                                      </div>
                                    </div>
                                  </Card>
                                </div>
                              </>
                            ) : (
                              /* Suppliers View */
                              <div>
                                <h5 className="text-lg font-semibold text-foreground mb-4">
                                  Available Suppliers & Pricing
                                </h5>
                                <div className="space-y-4">
                                  {material.suppliers.map((supplier: any, idx: number) => (
                                    <Card key={idx} className="p-6">
                                      {/* Company Header with Logo */}
                                      <div className="flex items-start gap-4 mb-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-16 h-16 rounded-full border-2 border-border bg-background p-2 flex items-center justify-center overflow-hidden">
                                            <img 
                                              src={supplier.logo} 
                                              alt={`${supplier.company} logo`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <h6 className="text-xl font-semibold text-foreground mb-1">
                                            {supplier.company}
                                          </h6>
                                          <div className="text-lg">{supplier.country}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm text-muted-foreground mb-1">Price Range</div>
                                          <div className="text-2xl font-bold text-primary flex items-center gap-1">
                                            <DollarSign className="h-5 w-5" />
                                            {supplier.pricing}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Product Image */}
                                      <div className="mb-4">
                                        <img 
                                          src={supplier.productImage} 
                                          alt={`${material.name} product from ${supplier.company}`}
                                          className="w-full h-48 object-cover rounded-lg"
                                        />
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <div className="text-sm font-medium text-foreground mb-2">
                                            Specific Properties:
                                          </div>
                                          <div className="space-y-1 text-sm">
                                            {Object.entries(supplier.properties).map(([key, value]) => (
                                              <div key={key} className="flex justify-between">
                                                <span className="text-muted-foreground capitalize">
                                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                </span>
                                                <span className="font-medium">{String(value)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-foreground mb-2">
                                            Order Details:
                                          </div>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Min Order:</span>
                                              <span className="font-medium">{supplier.minOrder}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Lead Time:</span>
                                              <span className="font-medium">{supplier.leadTime}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <div className="text-sm font-medium text-foreground mb-2">Certifications:</div>
                                        <div className="flex flex-wrap gap-2">
                                          {supplier.certifications.map((cert: string, i: number) => (
                                            <Badge key={i} variant="outline" className="gap-1">
                                              <Award className="h-3 w-3" />
                                              {cert}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <Button className="w-full mt-4" variant="default">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Request Quote from {supplier.company}
                                      </Button>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  No materials found. Try a different search term.
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            How Material Scouting Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our AI-powered workflow streamlines material discovery from search to selection
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <Card key={item.step} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Key Capabilities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Advanced features designed for material scientists and engineers
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8">
                <capability.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{capability.title}</h3>
                <p className="text-muted-foreground">{capability.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Real-World Applications
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            How material scientists use our scouting platform
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-foreground mb-4">
            Technical Specifications
          </h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Sources</h3>
                <p className="text-muted-foreground">Access to 5M+ materials from scientific journals, patents, Material Project, NIST databases, and industry repositories</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Search Algorithms</h3>
                <p className="text-muted-foreground">Natural language processing, semantic search, and machine learning models for intelligent material matching</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Output Formats</h3>
                <p className="text-muted-foreground">Detailed material data sheets, property charts, supplier information, sustainability scores, and citation references</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Accuracy</h3>
                <p className="text-muted-foreground">95%+ relevance in search results, validated against expert material selections</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Discover Your Next Material?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join researchers and engineers using AI to accelerate material discovery
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Get Started with Material Scouting
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaterialScouting;
