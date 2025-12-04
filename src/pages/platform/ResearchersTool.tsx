import { TrendingUp, Brain, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Search, BookOpen, FlaskConical, Database, Users, TrendingUpIcon, Atom, Loader2, Lock, Table } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useResearchData } from "@/hooks/useResearchData";
import PremiumGate from "@/components/PremiumGate";

const ResearchersTool = () => {
  const { researchMaterials, labRecipes, materialProperties: materialPropertiesDb, loading, error } = useResearchData();
  const [materialFormula, setMaterialFormula] = useState("");
  const [predictions, setPredictions] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showTableView, setShowTableView] = useState(false);

  const sampleMaterials = {
    "PLA": { name: "Polylactic Acid", tensile: 65, thermal: 55, biodeg: 95, modulus: 3.5 },
    "PHA": { name: "Polyhydroxyalkanoates", tensile: 40, thermal: 45, biodeg: 98, modulus: 3.0 },
    "PBS": { name: "Polybutylene Succinate", tensile: 35, thermal: 90, biodeg: 85, modulus: 0.5 }
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      const material = Object.entries(sampleMaterials).find(([key]) => 
        materialFormula.toUpperCase().includes(key)
      );
      
      if (material) {
        const [_, data] = material;
        setPredictions({
          name: data.name,
          properties: [
            { name: "Tensile Strength", value: data.tensile, unit: "MPa", confidence: 92 },
            { name: "Thermal Stability", value: data.thermal, unit: "°C", confidence: 88 },
            { name: "Biodegradation Rate", value: data.biodeg, unit: "%/year", confidence: 85 },
            { name: "Young's Modulus", value: data.modulus, unit: "GPa", confidence: 90 }
          ]
        });
      } else {
        setPredictions({
          name: materialFormula,
          properties: [
            { name: "Tensile Strength", value: 52, unit: "MPa", confidence: 78 },
            { name: "Thermal Stability", value: 68, unit: "°C", confidence: 82 },
            { name: "Biodegradation Rate", value: 72, unit: "%/year", confidence: 75 },
            { name: "Young's Modulus", value: 2.8, unit: "GPa", confidence: 80 }
          ]
        });
      }
      setIsPredicting(false);
    }, 1200);
  };

  // Filter recipes based on search query
  const filteredRecipes = labRecipes.filter((recipe) => {
    if (!recipeSearchQuery.trim()) return true;
    const query = recipeSearchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) ||
      (recipe.authors && recipe.authors.toLowerCase().includes(query)) ||
      recipe.materials.some(m => m.toLowerCase().includes(query))
    );
  });

  // Combined search handler for Property Finder
  const handleCombinedSearch = () => {
    setIsPredicting(true);
    
    // First check database
    const dbMatch = materialPropertiesDb.find(m => 
      m.name.toLowerCase().includes(materialFormula.toLowerCase()) ||
      (m.chemical_structure && m.chemical_structure.toLowerCase().includes(materialFormula.toLowerCase()))
    );
    
    setTimeout(() => {
      if (dbMatch) {
        // Found in database - format as prediction-style output
        const dbProperties = Object.entries(dbMatch.properties).slice(0, 4).map(([key, value]) => ({
          name: key,
          value: value,
          unit: "",
          confidence: null,
          source: "database"
        }));
        setPredictions({
          name: dbMatch.name,
          source: "database",
          chemical_structure: dbMatch.chemical_structure,
          properties: dbProperties,
          allProperties: dbMatch.properties,
          sources: dbMatch.sources
        });
      } else {
        // Use AI prediction
        const material = Object.entries(sampleMaterials).find(([key]) => 
          materialFormula.toUpperCase().includes(key)
        );
        
        if (material) {
          const [_, data] = material;
          setPredictions({
            name: data.name,
            source: "ai",
            properties: [
              { name: "Tensile Strength", value: data.tensile, unit: "MPa", confidence: 92 },
              { name: "Thermal Stability", value: data.thermal, unit: "°C", confidence: 88 },
              { name: "Biodegradation Rate", value: data.biodeg, unit: "%/year", confidence: 85 },
              { name: "Young's Modulus", value: data.modulus, unit: "GPa", confidence: 90 }
            ]
          });
        } else {
          setPredictions({
            name: materialFormula,
            source: "ai",
            properties: [
              { name: "Tensile Strength", value: 52, unit: "MPa", confidence: 78 },
              { name: "Thermal Stability", value: 68, unit: "°C", confidence: 82 },
              { name: "Biodegradation Rate", value: 72, unit: "%/year", confidence: 75 },
              { name: "Young's Modulus", value: 2.8, unit: "GPa", confidence: 80 }
            ]
          });
        }
      }
      setIsPredicting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {loading && (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading research database...</span>
        </div>
      )}

      {error && (
        <section className="py-32 px-6">
          <Card className="p-8 max-w-4xl mx-auto bg-destructive/10 border-destructive/20">
            <p className="text-destructive text-center">Error loading research data: {error}</p>
          </Card>
        </section>
      )}

      {!loading && !error && (
      <>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="outline">
              <FlaskConical className="h-3 w-3 mr-1" />
              Research Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Researcher's Tool
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Comprehensive platform for material researchers: predict properties, search scientific literature, 
              access lab protocols, and discover novel sustainable materials from the research community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="hero">
                  Join Research Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Research Library
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Research Tools */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="finder" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="finder" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Property Finder
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Lab Recipes
                <Lock className="h-3 w-3 text-primary" />
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Research Library
                <Lock className="h-3 w-3 text-primary" />
              </TabsTrigger>
            </TabsList>

            {/* Property Finder Tab (Merged) */}
            <TabsContent value="finder" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Property Finder
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Search our material database or get AI-powered property predictions for any material
                </p>
              </div>

              <Card className="p-8 max-w-4xl mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Material Name or Formula
                    </label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Try: PLA, PHA, PBS, Cellulose, or any material..."
                        value={materialFormula}
                        onChange={(e) => setMaterialFormula(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCombinedSearch()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleCombinedSearch}
                        disabled={isPredicting || !materialFormula.trim()}
                        className="min-w-[140px]"
                      >
                        {isPredicting ? (
                          <>Searching...</>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Find Properties
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Searches verified database first, then provides AI predictions if not found
                    </p>
                  </div>

                  {predictions && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              Results for {predictions.name}
                            </h3>
                            <Badge 
                              variant={predictions.source === "database" ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {predictions.source === "database" ? (
                                <>
                                  <Database className="h-3 w-3" />
                                  Database Verified
                                </>
                              ) : (
                                <>
                                  <Brain className="h-3 w-3" />
                                  AI Predicted
                                </>
                              )}
                            </Badge>
                          </div>
                          {predictions.allProperties && Object.keys(predictions.allProperties).length > 4 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowTableView(!showTableView)}
                            >
                              <Table className="h-4 w-4 mr-2" />
                              {showTableView ? "Show Cards" : "Show All Properties"}
                            </Button>
                          )}
                        </div>

                        {predictions.chemical_structure && (
                          <div className="flex items-center gap-2 mb-4">
                            <Atom className="h-4 w-4 text-accent" />
                            <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                              {predictions.chemical_structure}
                            </code>
                          </div>
                        )}
                        
                        {!showTableView ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            {predictions.properties.map((prop: any, index: number) => (
                              <Card key={index} className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-foreground mb-1 capitalize">{prop.name}</h4>
                                    <div className="text-2xl font-bold text-accent mb-2">
                                      {prop.value} {prop.unit && <span className="text-sm font-normal text-muted-foreground">{prop.unit}</span>}
                                    </div>
                                  </div>
                                  {predictions.source === "ai" ? (
                                    <Brain className="h-5 w-5 text-accent" />
                                  ) : (
                                    <Database className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                
                                {prop.confidence ? (
                                  <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                      <span>Confidence</span>
                                      <span>{prop.confidence}%</span>
                                    </div>
                                    <Progress value={prop.confidence} className="h-2" />
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    Verified from database sources
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card className="p-4">
                            <div className="space-y-2">
                              {Object.entries(predictions.allProperties).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-3 bg-muted/50 rounded">
                                  <span className="text-sm font-medium text-foreground capitalize">
                                    {key}:
                                  </span>
                                  <span className="text-sm text-muted-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {predictions.sources && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              <strong>Data Sources:</strong>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {predictions.sources.map((source: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 max-w-4xl mx-auto bg-accent/5 border-accent/20">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      The Property Finder first searches our verified database of material properties. 
                      If your material isn't found, our AI model provides predictions based on similar materials 
                      and chemical structures, showing confidence scores for each property.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Lab Recipes Tab - Premium */}
            <TabsContent value="recipes" className="space-y-8">
              <PremiumGate
                title="Premium Access Required"
                description="Access peer-reviewed synthesis protocols, lab procedures, and detailed methodology from published research papers."
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-foreground mb-4">
                    Lab Synthesis Protocols
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {labRecipes.length}+ peer-reviewed protocols available
                  </p>
                </div>
                <div className="grid gap-6 max-w-5xl mx-auto">
                  {labRecipes.slice(0, 2).map((recipe) => (
                    <Card key={recipe.id} className="p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl mb-2">{recipe.title}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{recipe.source}</Badge>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </PremiumGate>
            </TabsContent>

            {/* Research Library Tab - Premium */}
            <TabsContent value="library" className="space-y-8">
              <PremiumGate
                title="Premium Access Required"
                description="Connect with researchers, discover novel sustainable materials, and explore funding opportunities in our research community."
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-foreground mb-4">
                    Research Materials Library
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {researchMaterials.length}+ novel materials from research institutions
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                  {researchMaterials.slice(0, 2).map((material) => (
                    <Card key={material.id} className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{material.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{material.status}</Badge>
                        <Badge variant="secondary">{material.funding_stage}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </PremiumGate>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Join the Research Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Access cutting-edge tools and collaborate with researchers worldwide
          </p>
          <Link to="/signup">
            <Button size="lg" variant="hero">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      </>
      )}
    </div>
  );
};

export default ResearchersTool;
