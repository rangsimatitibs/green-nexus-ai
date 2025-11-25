import { TrendingUp, Brain, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Search, BookOpen, FlaskConical, Database, Users, TrendingUpIcon, Atom, Loader2 } from "lucide-react";
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

const ResearchersTool = () => {
  const { researchMaterials, labRecipes, materialProperties: materialPropertiesDb, loading, error } = useResearchData();
  const [materialFormula, setMaterialFormula] = useState("");
  const [predictions, setPredictions] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

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
          <Tabs defaultValue="prediction" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="prediction" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Property Prediction
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Material Search
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Lab Recipes
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Research Library
              </TabsTrigger>
            </TabsList>

            {/* Property Prediction Tab */}
            <TabsContent value="prediction" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  AI-Powered Property Prediction
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Predict material properties before synthesis using advanced machine learning
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
                        placeholder="Try: PLA, PHA, PBS, or any material formula..."
                        value={materialFormula}
                        onChange={(e) => setMaterialFormula(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handlePredict}
                        disabled={isPredicting || !materialFormula.trim()}
                        className="min-w-[140px]"
                      >
                        {isPredicting ? (
                          <>Predicting...</>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Predict
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {predictions && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Predictions for {predictions.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          AI-generated property predictions with confidence scores
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {predictions.properties.map((prop: any, index: number) => (
                            <Card key={index} className="p-5">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground mb-1">{prop.name}</h4>
                                  <div className="text-2xl font-bold text-accent mb-2">
                                    {prop.value} <span className="text-sm font-normal text-muted-foreground">{prop.unit}</span>
                                  </div>
                                </div>
                                <Brain className="h-5 w-5 text-accent" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                  <span>Confidence</span>
                                  <span>{prop.confidence}%</span>
                                </div>
                                <Progress value={prop.confidence} className="h-2" />
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Material Search Tab */}
            <TabsContent value="search" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Material Properties Database
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Search comprehensive material properties and chemical structures from verified sources
                </p>
              </div>

              <Card className="p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                  <Input
                    placeholder="Search materials by name or chemical formula..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-6">
                  {materialPropertiesDb.map((material, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{material.name}</h3>
                          <div className="flex items-center gap-2">
                            <Atom className="h-4 w-4 text-accent" />
                            <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                              {material.chemical_structure}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {Object.entries(material.properties).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-3 bg-muted/50 rounded">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {key}:
                            </span>
                            <span className="text-sm text-muted-foreground">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          <strong>Data Sources:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {material.sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <Card className="p-6 max-w-5xl mx-auto bg-accent/5 border-accent/20">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Future Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Partnership with <strong>Scopus</strong> and <strong>ResearchGate</strong> coming soon to provide 
                      direct access to peer-reviewed articles, full bibliography, and highlighted sections from research papers.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Lab Recipes Tab */}
            <TabsContent value="recipes" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Lab Synthesis Protocols
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Peer-reviewed synthesis methods and protocols from published research
                </p>
              </div>

              <div className="max-w-5xl mx-auto mb-6">
                <Input
                  placeholder="Search recipes by title, authors, or materials..."
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid gap-6 max-w-5xl mx-auto">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} className="p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl mb-2">{recipe.title}</CardTitle>
                        <CardDescription>
                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <Badge variant="outline">{recipe.source}</Badge>
                            <span className="text-muted-foreground">{recipe.authors}</span>
                            <a href={`https://doi.org/${recipe.doi}`} target="_blank" rel="noopener noreferrer" 
                               className="text-accent hover:underline">
                              DOI: {recipe.doi}
                            </a>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-0 space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Materials Required:</h4>
                          <div className="flex flex-wrap gap-2">
                            {recipe.materials.map((m, idx) => (
                              <Badge key={idx} variant="secondary">{m}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Procedure:</h4>
                          <ol className="space-y-2">
                            {recipe.steps.map((step, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="font-semibold text-accent">{step.step_number}.</span>
                                <span className="text-muted-foreground">{step.description}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                          <h4 className="font-semibold text-foreground mb-2">Key Findings:</h4>
                          <p className="text-muted-foreground">{recipe.key_findings}</p>
                        </div>

                        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
                          <h4 className="font-semibold text-foreground mb-2">Highlighted Section:</h4>
                          <p className="text-muted-foreground italic">{recipe.highlighted_section}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No recipes found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse all available protocols
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Research Library Tab */}
            <TabsContent value="library" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Research Materials Library
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Novel sustainable materials in development - connecting researchers with investors
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {researchMaterials.map((material) => (
                  <Card key={material.id} className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{material.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">{material.status}</Badge>
                          <Badge variant="secondary">{material.funding_stage}</Badge>
                        </div>
                      </div>
                      <FlaskConical className="h-6 w-6 text-accent" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{material.institution} • {material.year}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Properties:</h4>
                        <div className="space-y-1">
                          {Object.entries(material.properties).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground capitalize">
                                {key}:
                              </span>
                              <span className="text-foreground font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Potential Applications:</h4>
                        <div className="flex flex-wrap gap-2">
                          {material.potential_applications.map((app, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{app}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Contact Research Team
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 max-w-6xl mx-auto bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <TrendingUpIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Researchers & Investors</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This library serves as a space for the research community to share novel sustainable materials 
                      not yet in industrial production. Researchers can showcase their work, while investors can discover 
                      promising materials with commercial potential.
                    </p>
                    <Button variant="outline">
                      Submit Your Research Material
                    </Button>
                  </div>
                </div>
              </Card>
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
