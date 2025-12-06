import { TrendingUp, Brain, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Search, BookOpen, FlaskConical, Database, Users, TrendingUpIcon, Atom, Loader2, Lock, Table, Globe, GraduationCap, Star } from "lucide-react";
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
import { useUnifiedMaterialSearch } from "@/hooks/useUnifiedMaterialSearch";
import PremiumGate from "@/components/PremiumGate";
import { filterResearchProperties } from "@/data/researchProperties";
import { CategorizedProperties } from "@/components/CategorizedProperties";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { BibliographySearch } from "@/components/BibliographySearch";

const ResearchersTool = () => {
  const { researchMaterials, labRecipes, materialProperties: materialPropertiesDb, loading, error } = useResearchData();
  const { search: unifiedSearch, loading: searchLoading, lastSearchSource } = useUnifiedMaterialSearch();
  const [materialFormula, setMaterialFormula] = useState("");
  const [predictions, setPredictions] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showTableView, setShowTableView] = useState(false);
  const [deepSearch, setDeepSearch] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("finder");
  const [bibliographyQuery, setBibliographyQuery] = useState("");
  const [exploredProperties, setExploredProperties] = useState<Array<{ name: string; value: string; isAIGenerated: boolean }>>([]);

  // Handler to add explored property to output
  const handleAddExploredProperty = (property: { name: string; value: string; isAIGenerated: boolean }) => {
    setExploredProperties(prev => {
      if (prev.some(p => p.name === property.name)) return prev;
      return [...prev, property];
    });
  };

  // Handler to search bibliography from property finder
  const handleLookForBibliography = (materialName: string) => {
    setBibliographyQuery(materialName);
    setActiveMainTab("bibliography");
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

  // Combined search handler for Property Finder - uses unified search
  const handleCombinedSearch = async () => {
    setIsPredicting(true);
    const searchTerm = materialFormula.toLowerCase().trim();
    
    try {
      // 1. First check material_properties_database (verified scientific data)
      const dbMatch = materialPropertiesDb.find(m => 
        m.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(m.name.toLowerCase()) ||
        (m.chemical_structure && m.chemical_structure.toLowerCase().includes(searchTerm))
      );
      
      if (dbMatch) {
        // Found in verified database
        const dbProperties = Object.entries(dbMatch.properties).map(([key, value]) => ({
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
          properties: dbProperties.slice(0, 4),
          allProperties: dbMatch.properties,
          sources: dbMatch.sources
        });
        setIsPredicting(false);
        return;
      }

      // 2. Check research materials (novel materials in development)
      const researchMatch = researchMaterials.find(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(m.name.toLowerCase())
      );

      if (researchMatch) {
        const researchProperties = Object.entries(researchMatch.properties).map(([key, value]) => ({
          name: key,
          value: value,
          unit: "",
          confidence: null,
          source: "research"
        }));
        setPredictions({
          name: researchMatch.name,
          source: "research",
          properties: researchProperties.slice(0, 4),
          allProperties: researchMatch.properties,
          sources: [researchMatch.institution],
          researchInfo: {
            status: researchMatch.status,
            institution: researchMatch.institution,
            year: researchMatch.year,
            funding_stage: researchMatch.funding_stage
          }
        });
        setIsPredicting(false);
        return;
      }

      // 3. Use unified search (searches local materials + optional external PubChem)
      const searchResults = await unifiedSearch(searchTerm, {});
      
      if (searchResults.length > 0) {
        const match = searchResults[0];
        const scoutProperties = Object.entries(match.properties).map(([key, value]) => ({
          name: key,
          value: value,
          unit: "",
          confidence: null,
          source: match.data_source === 'pubchem' ? 'pubchem' : 'database'
        }));
        setPredictions({
          name: match.name,
          source: match.data_source === 'pubchem' ? 'pubchem' : 'database',
          chemical_structure: match.chemical_structure,
          chemical_formula: match.chemical_formula,
          properties: scoutProperties.slice(0, 4),
          allProperties: match.properties,
          sources: match.data_source === 'pubchem' ? ['PubChem'] : ['MaterialInk Database'],
          external_id: match.external_id
        });
        setIsPredicting(false);
        return;
      }

      // 4. No match found - show helpful message
      setPredictions({
        name: materialFormula,
        source: "not_found",
        properties: [],
        message: `"${materialFormula}" was not found in our databases${deepSearch ? ' or external sources' : ''}. Try searching for common biopolymers like PLA, Cellulose, PHA, or check the spelling.`
      });
      setIsPredicting(false);
    } catch (err) {
      console.error('Search error:', err);
      setPredictions({
        name: materialFormula,
        source: "not_found",
        properties: [],
        message: `Error searching for "${materialFormula}". Please try again.`
      });
      setIsPredicting(false);
    }
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
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="finder" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Property Finder
              </TabsTrigger>
              <TabsTrigger value="bibliography" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Bibliography
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
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
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Searches local database first{deepSearch ? ', then extended databases' : ''}
                      </p>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={deepSearch} 
                          onChange={(e) => setDeepSearch(e.target.checked)}
                          className="rounded border-input"
                        />
                        <span className="text-muted-foreground">Deep Search</span>
                      </label>
                    </div>
                  </div>

                  {predictions && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-t pt-6">
                        {predictions.source === "not_found" ? (
                          // Not found state
                          <Card className="p-6 bg-muted/50 text-center">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              Material Not Found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {predictions.message}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              <span className="text-sm text-muted-foreground">Try:</span>
                              {["PLA", "Cellulose", "Sulapac", "Bio-PE"].map((suggestion) => (
                                <Button
                                  key={suggestion}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setMaterialFormula(suggestion);
                                    setTimeout(() => handleCombinedSearch(), 100);
                                  }}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </Card>
                        ) : (
                          <>
                            {/* Results Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  Results for {predictions.name}
                                </h3>
                                <Badge 
                                  variant={predictions.source === "database" || predictions.source === "pubchem" ? "default" : predictions.source === "research" ? "secondary" : "outline"}
                                  className="gap-1"
                                >
                                  {predictions.source === "database" ? (
                                    <>
                                      <Database className="h-3 w-3" />
                                      Database Verified
                                    </>
                                  ) : predictions.source === "pubchem" ? (
                                    <>
                                      <Globe className="h-3 w-3" />
                                      PubChem Data
                                    </>
                                  ) : predictions.source === "research" ? (
                                    <>
                                      <FlaskConical className="h-3 w-3" />
                                      Research Material
                                    </>
                                  ) : (
                                    <>
                                      <Brain className="h-3 w-3" />
                                      AI Predicted
                                    </>
                                  )}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons - Reorganized */}
                            {predictions.allProperties && Object.keys(predictions.allProperties).length > 0 && (
                              <Card className="p-4 mb-4 bg-muted/30 border-muted">
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleLookForBibliography(predictions.name)}
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    Find Research Papers
                                  </Button>
                                  <PropertyExplorer 
                                    materialName={predictions.name}
                                    existingProperties={predictions.allProperties || {}}
                                    onAddToOutput={handleAddExploredProperty}
                                  />
                                  {Object.keys(predictions.allProperties).length > 4 && (
                                    <Button 
                                      variant={showTableView ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setShowTableView(!showTableView)}
                                    >
                                      <Table className="h-4 w-4 mr-2" />
                                      {showTableView ? "Table View ✓" : "Table View"}
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            )}

                            {/* Explored Properties Output */}
                            {exploredProperties.length > 0 && (
                              <Card className="p-4 mb-4 border-primary/30 bg-primary/5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Added Properties ({exploredProperties.length})
                                  </h4>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setExploredProperties([])}
                                    className="text-xs h-7"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {exploredProperties.map((prop, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-background rounded border">
                                      <div>
                                        <span className="text-xs text-muted-foreground">{prop.name}</span>
                                        <p className="text-sm font-medium">{prop.value}</p>
                                      </div>
                                      {prop.isAIGenerated && (
                                        <Badge variant="secondary" className="text-xs">AI</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {predictions.chemical_structure && (
                              <div className="flex items-center gap-2 mb-4">
                                <Atom className="h-4 w-4 text-accent" />
                                <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {predictions.chemical_structure}
                                </code>
                              </div>
                            )}

                            {predictions.researchInfo && (
                              <Card className="p-4 mb-4 bg-secondary/50 border-secondary">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                  <FlaskConical className="h-4 w-4 text-primary" />
                                  <span><strong>Status:</strong> {predictions.researchInfo.status}</span>
                                  <span className="text-muted-foreground">|</span>
                                  <span><strong>Institution:</strong> {predictions.researchInfo.institution}</span>
                                  <span className="text-muted-foreground">|</span>
                                  <span><strong>Year:</strong> {predictions.researchInfo.year}</span>
                                </div>
                              </Card>
                            )}
                            
                            {!showTableView ? (
                              <CategorizedProperties 
                                properties={Object.entries(predictions.allProperties || {}).map(([key, value]) => ({
                                  name: key,
                                  value: String(value),
                                  source: predictions.source === "research" 
                                    ? predictions.researchInfo?.institution || "Research" 
                                    : predictions.source === "pubchem" 
                                      ? "PubChem" 
                                      : "Database"
                                }))}
                              />
                            ) : (
                              <Card className="p-4">
                                <div className="space-y-2">
                                  {Object.entries(predictions.allProperties || {}).map(([key, value]) => (
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
                          </>
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

            {/* Bibliography Tab - Star Feature */}
            <TabsContent value="bibliography" className="space-y-8">
              <BibliographySearch initialQuery={bibliographyQuery} />
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
