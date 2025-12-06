import { Search, Database, Target, CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp, Factory, Scale, Lightbulb, Award, DollarSign, TrendingUp, Atom, GitCompare, X, Download, Loader2, FileText, Lock, Globe, Bot, FlaskConical, Info, Check, AlertCircle } from "lucide-react";
import PremiumGate from "@/components/PremiumGate";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUnifiedMaterialSearch } from "@/hooks/useUnifiedMaterialSearch";
import { SourceBadge, SourcesList } from "@/components/ui/SourceBadge";
import { MaterialSourcesList } from "@/components/ui/MaterialSourceBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getRegulationDescription } from "@/data/regulationDescriptions";
import { CategorizedProperties } from "@/components/CategorizedProperties";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { AdvancedPropertySearch, PropertyRequirement } from "@/components/AdvancedPropertySearch";

// Pagination
const RESULTS_PER_PAGE = 10;

// Common name mappings for complex IUPAC names
const SIMPLE_NAME_MAPPINGS: Record<string, string> = {
  'chitosan': 'Chitosan',
  'cellulose': 'Cellulose',
  'nanocellulose': 'Nanocellulose',
  'chitin': 'Chitin',
  'starch': 'Starch',
  'lignin': 'Lignin',
  'pectin': 'Pectin',
  'alginate': 'Alginate',
  'carrageenan': 'Carrageenan',
  'gelatin': 'Gelatin',
  'collagen': 'Collagen',
  'keratin': 'Keratin',
  'silk': 'Silk Fibroin',
  'polylactic': 'PLA (Polylactic Acid)',
  'polyhydroxybutyrate': 'PHB',
  'polyhydroxyalkanoate': 'PHA',
  'polycaprolactone': 'PCL (Polycaprolactone)',
  'polybutylene succinate': 'PBS',
  'hydroxybenzoic': 'p-Hydroxybenzoic Acid',
  '4-hydroxybenzoic': 'p-Hydroxybenzoic Acid',
  'pentamidin': 'Pentamidine',
  'carbamimidoyl': 'Pentamidine analog',
};

// Simplify complex IUPAC names to common names when possible
const simplifyMaterialName = (name: string, iupacName?: string): string => {
  if (!name) return 'Unknown Material';
  
  const lowerName = name.toLowerCase();
  
  // Check if name is too complex (contains many stereochemistry markers)
  const stereochemistryCount = (name.match(/\(\d[SRsr],/g) || []).length;
  if (stereochemistryCount > 3) {
    // Try to find a simpler name from mappings
    for (const [key, simpleName] of Object.entries(SIMPLE_NAME_MAPPINGS)) {
      if (lowerName.includes(key)) {
        return simpleName;
      }
    }
    // Check IUPAC name for clues
    if (iupacName) {
      for (const [key, simpleName] of Object.entries(SIMPLE_NAME_MAPPINGS)) {
        if (iupacName.toLowerCase().includes(key)) {
          return simpleName;
        }
      }
    }
    // If still complex, try to extract a meaningful part
    if (lowerName.includes('carbamate') && lowerName.includes('amino')) {
      return 'Chitosan derivative';
    }
    if (lowerName.includes('oxan') && lowerName.includes('hydroxymethyl')) {
      return 'Polysaccharide derivative';
    }
  }
  
  // Apply simple name mappings
  for (const [key, simpleName] of Object.entries(SIMPLE_NAME_MAPPINGS)) {
    if (lowerName.includes(key)) {
      return simpleName;
    }
  }
  
  return name;
};

// Normalize names for deduplication
const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Deduplicate materials by normalized name
const deduplicateMaterials = (materials: any[]): any[] => {
  const seen = new Map<string, any>();
  
  for (const material of materials) {
    const simpleName = simplifyMaterialName(material.name, material.iupac_name);
    const normalizedName = normalizeName(simpleName);
    
    if (!seen.has(normalizedName)) {
      // Store with simplified name
      seen.set(normalizedName, {
        ...material,
        displayName: simpleName,
        originalName: material.name,
      });
    }
  }
  
  return Array.from(seen.values());
};

const TruncatedIUPACName = ({ name }: { name: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!name || name.length <= 100) return null;
  
  return (
    <div className="mb-2">
      <span className="text-xs text-muted-foreground">IUPAC Name: </span>
      <span className={`text-xs text-muted-foreground ${!expanded ? 'line-clamp-2' : ''}`}>
        {name}
      </span>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary hover:underline ml-1"
      >
        {expanded ? '(show less)' : '(read more...)'}
      </button>
    </div>
  );
};

const MaterialScouting = () => {
  const { loading: materialsLoading, error: materialsError, search, lastSearchSource, canLoadMore, loadMore, isLoadingMore, results } = useUnifiedMaterialSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayResults, setDisplayResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "suppliers">("overview");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Advanced search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [propertyRequirements, setPropertyRequirements] = useState<PropertyRequirement[]>([]);
  const [hasActiveRequirements, setHasActiveRequirements] = useState(false);
  const [exploredPropertiesMap, setExploredPropertiesMap] = useState<Record<string, Array<{ name: string; value: string; isAIGenerated: boolean }>>>({});

  // Handler to add explored property to output for a specific material
  const handleAddExploredProperty = (materialId: string, property: { name: string; value: string; isAIGenerated: boolean }) => {
    setExploredPropertiesMap(prev => {
      const existing = prev[materialId] || [];
      if (existing.some(p => p.name === property.name)) return prev;
      return { ...prev, [materialId]: [...existing, property] };
    });
  };


  const handleSearch = async () => {
    setIsSearching(true);
    setExpandedMaterial(null);
    setViewMode("overview");
    setSelectedMaterials([]);
    setCurrentPage(1); // Reset to first page on new search
    
    try {
      const filters = {
        category: undefined,
        source: undefined,
        propertyRequirements: propertyRequirements.filter(p => p.property.trim() && p.value.trim()),
      };

      const results = await search(searchQuery, filters);
      setDisplayResults(deduplicateMaterials(results));
      setHasActiveRequirements(filters.propertyRequirements.length > 0);
    } catch (err) {
      console.error('Search error:', err);
      setDisplayResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAdvancedSearch = async (
    requirements: PropertyRequirement[], 
    industry: string, 
    application: string, 
    additionalReqs: string
  ) => {
    setPropertyRequirements(requirements);
    setIsSearching(true);
    setExpandedMaterial(null);
    setViewMode("overview");
    setSelectedMaterials([]);
    setCurrentPage(1);
    
    try {
      // Build search query from requirements
      let query = searchQuery;
      if (!query && requirements.length > 0) {
        // Generate search query from requirements
        query = requirements.map(r => r.property).join(' ');
      }
      if (industry) query += ` ${industry}`;
      if (application) query += ` ${application}`;
      
      const filters = {
        category: undefined,
        source: undefined,
        propertyRequirements: requirements.filter(p => p.property.trim() && p.value.trim()),
      };

      const results = await search(query || 'materials', filters);
      setDisplayResults(deduplicateMaterials(results));
      setHasActiveRequirements(filters.propertyRequirements.length > 0);
    } catch (err) {
      console.error('Search error:', err);
      setDisplayResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleMaterialSelection = (materialId: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId) 
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const getComparisonData = () => {
    return displayResults.filter(m => selectedMaterials.includes(m.id));
  };

  // Pagination calculations
  const totalPages = Math.ceil(displayResults.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const paginatedResults = displayResults.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const getPropertyDifference = (property: string, materials: any[]) => {
    const values = materials.map(m => {
      if (property.includes('.')) {
        const [parent, child] = property.split('.');
        return m[parent]?.[child];
      }
      return m.properties?.[property];
    });
    
    const uniqueValues = [...new Set(values.filter(v => v !== undefined))];
    return uniqueValues.length > 1;
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

          {materialsLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading materials database...</span>
            </div>
          )}

          {materialsError && (
            <Card className="p-8 max-w-4xl mx-auto bg-destructive/10 border-destructive/20">
              <p className="text-destructive text-center">Error loading materials: {materialsError}</p>
            </Card>
          )}

          {!materialsLoading && !materialsError && (
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

              {/* Advanced Search Toggle */}
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="w-full"
              >
                {showAdvancedSearch ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Smart Property Search
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Smart Property Search (AI-Powered)
                  </>
                )}
              </Button>

              {/* Advanced Search Panel - New Component */}
              {showAdvancedSearch && (
                <AdvancedPropertySearch 
                  onSearch={handleAdvancedSearch}
                  isSearching={isSearching}
                />
              )}

              {displayResults.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        Found {displayResults.length} Materials
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        (Showing {startIndex + 1}-{Math.min(endIndex, displayResults.length)})
                      </span>
                      {lastSearchSource === 'ai' && displayResults[0]?.sources_used && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">from:</span>
                          <SourcesList sources={displayResults[0].sources_used} />
                        </div>
                      )}
                    </div>
                    {selectedMaterials.length > 0 && (
                      <Button 
                        onClick={() => setShowComparison(true)}
                        variant="default"
                        className="gap-2"
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare ({selectedMaterials.length})
                      </Button>
                    )}
                  </div>
                  {paginatedResults.map((material) => (
                    <Card key={material.id} className="overflow-hidden">
                      {/* Main Material Card */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox 
                              checked={selectedMaterials.includes(material.id)}
                              onCheckedChange={() => toggleMaterialSelection(material.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-xl font-semibold text-foreground">
                                {material.displayName || simplifyMaterialName(material.name, material.iupac_name)}
                              </h4>
                              <Badge variant="secondary">{material.category}</Badge>
                              {/* Show requirement match score if searching with property requirements */}
                              {material.requirementMatchScore !== undefined && (
                                <Badge 
                                  variant={material.requirementMatchScore >= 70 ? "default" : material.requirementMatchScore >= 40 ? "secondary" : "outline"}
                                  className={material.requirementMatchScore >= 70 ? "bg-green-600" : ""}
                                >
                                  {material.requirementMatchScore >= 70 ? <Check className="h-3 w-3 mr-1" /> : null}
                                  {material.requirementMatchScore}% Match
                                </Badge>
                              )}
                            </div>
                            {/* Long IUPAC name truncated - use iupac_name field from API */}
                            {material.iupac_name && (
                              <TruncatedIUPACName name={material.iupac_name} />
                            )}
                            {/* AI Summary */}
                            {material.ai_summary && (
                              <Card className="p-3 bg-orange-500/5 border-orange-500/20 mb-3">
                                <div className="flex items-start gap-2 text-sm">
                                  <Bot className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold text-orange-600">AI Summary: </span>
                                    <span className="text-foreground">{material.ai_summary}</span>
                                  </div>
                                </div>
                              </Card>
                            )}
                            {/* Synonyms */}
                            {material.synonyms && material.synonyms.length > 0 && (
                              <div className="mb-3">
                                <span className="text-xs text-muted-foreground">Also known as: </span>
                                <span className="text-xs text-foreground">{material.synonyms.slice(0, 5).join(', ')}</span>
                              </div>
                            )}
                            {material.chemical_formula && (
                              <div className="mb-3">
                                <Card className="p-3 bg-muted/50 inline-block">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Atom className="h-4 w-4 text-primary" />
                                    <div>
                                      <span className="font-medium text-foreground">Formula: </span>
                                      <span className="text-muted-foreground">{material.chemical_formula}</span>
                                    </div>
                                  </div>
                                  {material.chemical_structure && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Structure: {material.chemical_structure}
                                    </div>
                                  )}
                                </Card>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {material.scale && (
                                <Badge variant="outline" className="gap-1">
                                  <Scale className="h-3 w-3" />
                                  {material.scale}
                                </Badge>
                              )}
                              {material.innovation && (
                                <Badge variant="outline" className="gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  {material.innovation}
                                </Badge>
                              )}
                            </div>
                            {material.uniqueness && (
                              <Card className="p-3 bg-primary/5 border-primary/20 mb-3">
                                <div className="flex items-start gap-2 text-sm">
                                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold text-primary">Unique Aspect: </span>
                                    <span className="text-foreground">{material.uniqueness}</span>
                                  </div>
                                </div>
                              </Card>
                            )}
                            </div>
                          </div>
                          {material.sustainability?.score !== undefined && material.sustainability.score > 0 && (
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">Sustainability</div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help justify-end">
                                      <span className="text-3xl font-bold text-primary">{material.sustainability.score}%</span>
                                      {material.sustainability.source === 'AI Analysis' && (
                                        <Bot className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">
                                      {material.sustainability.justification || 
                                        `Based on ${material.sustainability.source?.toLowerCase() || 'available data'}`}
                                    </p>
                                    {material.sustainability.source === 'AI Analysis' && (
                                      <p className="text-xs text-muted-foreground mt-1">AI-estimated score</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>

                        {/* Material Sources Section */}
                        {material.material_source && material.material_source.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-foreground mb-2">Sources:</div>
                            <MaterialSourcesList sources={material.material_source} />
                          </div>
                        )}

                        {(material.applications?.length > 0 || material.regulations?.length > 0) && (
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {material.applications?.length > 0 && (
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
                            )}
                            {material.regulations?.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-foreground mb-2">Regulations:</div>
                                <div className="flex flex-wrap gap-2">
                                  {material.regulations.map((reg: string, i: number) => {
                                    const description = getRegulationDescription(reg);
                                    return description ? (
                                      <TooltipProvider key={i}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="inline-flex">
                                              <Badge variant="outline" className="gap-1 cursor-help">
                                                <Award className="h-3 w-3" />
                                                {reg}
                                              </Badge>
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <p>{description}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ) : (
                                      <Badge key={i} variant="outline" className="gap-1">
                                        <Award className="h-3 w-3" />
                                        {reg}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show properties for external results without applications */}
                        {(!material.applications?.length && !material.regulations?.length && material.properties && Object.keys(material.properties).length > 0) && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-foreground mb-2">Properties:</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(material.properties).slice(0, 6).map(([key, value], i) => (
                                <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                  <span className="text-muted-foreground">{key}: </span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setExpandedMaterial(expandedMaterial === material.id ? null : material.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            {expandedMaterial === material.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                View Properties & Suppliers
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 opacity-60 cursor-not-allowed"
                            disabled
                            title="Upgrade to Premium to access detailed data sheets"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Advanced Data Sheet
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Premium</span>
                          </Button>
                        </div>
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
                                className="relative"
                              >
                                <Factory className="h-4 w-4 mr-2" />
                                Find Suppliers ({material.suppliers.length})
                                <Lock className="h-3 w-3 ml-2 text-primary" />
                              </Button>
                            </div>

                            {viewMode === "overview" ? (
                              <>
                                {/* Categorized Properties */}
                                <div>
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-semibold text-foreground">Material Properties</h5>
                                    <PropertyExplorer 
                                      materialName={material.name}
                                      existingProperties={material.properties}
                                      onAddToOutput={(prop) => handleAddExploredProperty(material.id, prop)}
                                    />
                                  </div>
                                  {material.propertiesWithSource && material.propertiesWithSource.length > 0 ? (
                                    <CategorizedProperties properties={material.propertiesWithSource} />
                                  ) : Object.keys(material.properties).length > 0 ? (
                                    <CategorizedProperties 
                                      properties={Object.entries(material.properties).map(([key, value]) => ({
                                        name: key,
                                        value: String(value),
                                        source: material.data_source || 'Your Database'
                                      }))}
                                    />
                                  ) : (
                                    <div className="text-muted-foreground text-sm py-4">
                                      No properties available. Use "Find Additional Properties" to explore.
                                    </div>
                                  )}
                                </div>

                                {/* Explored Properties Output */}
                                {exploredPropertiesMap[material.id]?.length > 0 && (
                                  <Card className="p-4 mt-4 border-primary/30 bg-primary/5">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Added Properties ({exploredPropertiesMap[material.id].length})
                                      </h5>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setExploredPropertiesMap(prev => {
                                          const updated = { ...prev };
                                          delete updated[material.id];
                                          return updated;
                                        })}
                                        className="text-xs h-7"
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {exploredPropertiesMap[material.id].map((prop, idx) => (
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

                              </>
                            ) : (
                              /* Suppliers View - Premium Gated */
                              <PremiumGate
                                title="Premium Access Required"
                                description="Unlock supplier contacts, pricing information, and detailed product specifications with Premium access."
                              >
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
                                          <div className="w-16 h-16 rounded-full border-2 border-border bg-background flex items-center justify-center overflow-hidden">
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

                                      {/* Uniqueness */}
                                      {supplier.uniqueness && (
                                        <Card className="p-3 bg-primary/5 border-primary/20 mb-4">
                                          <div className="flex items-start gap-2 text-sm">
                                            <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                              <span className="font-semibold text-primary">What Makes Them Unique: </span>
                                              <span className="text-foreground">{supplier.uniqueness}</span>
                                            </div>
                                          </div>
                                        </Card>
                                      )}

                                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        {/* Properties Column */}
                                        {supplier.detailedProperties ? (
                                          <div className="md:col-span-2">
                                            <div className="text-sm font-medium text-foreground mb-3">
                                              Technical Data Sheet:
                                            </div>
                                            <div className="space-y-4">
                                              {supplier.detailedProperties.physical && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Physical Properties</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.physical).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.tensile && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Tensile Properties (ISO 527-1)</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.tensile).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.flexural && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Flexural Properties (ISO 178)</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.flexural).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.impact && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Impact Properties</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.impact).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.rheological && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Rheological Properties</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.rheological).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.thermal && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Thermal Properties</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.thermal).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.biobased && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Biobased Content</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.biobased).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {supplier.detailedProperties.processing && (
                                                <div>
                                                  <h6 className="text-xs font-semibold text-primary uppercase mb-2">Processing Conditions</h6>
                                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2">
                                                    {Object.entries(supplier.detailedProperties.processing).map(([key, value]) => (
                                                      <div key={key} className="flex justify-between py-1 border-b border-border/30">
                                                        <span className="text-muted-foreground">{key}:</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
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
                                        )}
                                        
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
                              </PremiumGate>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {displayResults.length > RESULTS_PER_PAGE && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = page === 1 || page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      const showEllipsis = page === currentPage - 2 || page === currentPage + 2;
                      
                      if (!showPage && !showEllipsis) return null;
                      if (showEllipsis) return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Load More Button - shows when on last page and can load more */}
              {displayResults.length > 0 && canLoadMore && currentPage === totalPages && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={async () => {
                      const additionalResults = await loadMore();
                      if (additionalResults.length > 0) {
                        setDisplayResults(prev => [...prev, ...additionalResults]);
                      }
                    }}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching more databases...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Load More Results
                      </>
                    )}
                  </Button>
                </div>
              )}

              {displayResults.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  No materials found. Try a different search term or check the spelling.
                </div>
              )}
            </div>
          </Card>
          )}
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

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Material Comparison</DialogTitle>
                <DialogDescription>
                  Side-by-side comparison of {selectedMaterials.length} selected materials
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComparison(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid gap-6 mt-6" style={{ gridTemplateColumns: `repeat(${selectedMaterials.length}, minmax(300px, 1fr))` }}>
            {getComparisonData().map((material) => {
              const exploredProps = exploredPropertiesMap[material.id] || [];
              
              // Group properties by category
              const groupedProperties: Record<string, Array<{ name: string; value: string }>> = {};
              if (material.properties) {
                Object.entries(material.properties).forEach(([key, value]) => {
                  const category = 'General Properties';
                  if (!groupedProperties[category]) groupedProperties[category] = [];
                  groupedProperties[category].push({ name: key.replace(/([A-Z])/g, ' $1').trim(), value: String(value) });
                });
              }
              
              // Add explored properties as a separate category
              if (exploredProps.length > 0) {
                groupedProperties['Explored Properties'] = exploredProps.map(p => ({ name: p.name, value: p.value }));
              }

              return (
                <Card key={material.id} className="p-6 space-y-4">
                  {/* Section 1: Header & Category */}
                  <div className="border-b border-border pb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {material.displayName || simplifyMaterialName(material.name, material.iupac_name)}
                    </h3>
                    {material.originalName && material.originalName !== material.displayName && (
                      <p className="text-xs text-muted-foreground mb-2 italic">
                        Original: {material.originalName.length > 60 ? material.originalName.substring(0, 60) + '...' : material.originalName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{material.category}</Badge>
                      {material.material_source && (
                        <MaterialSourcesList sources={material.material_source} />
                      )}
                    </div>
                  </div>

                  {/* Section 2: Chemical Structure & Formula */}
                  <div className={`rounded-lg p-4 ${getPropertyDifference('chemicalFormula', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Atom className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Chemical Information</span>
                    </div>
                    {material.chemical_formula && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Formula: </span>
                        <span className="text-sm font-mono text-foreground">{material.chemical_formula}</span>
                      </div>
                    )}
                    {material.chemical_structure && (
                      <div className="bg-background rounded p-3 border border-border">
                        <span className="text-xs text-muted-foreground block mb-1">Structure:</span>
                        <span className="text-xs font-mono text-foreground break-all">{material.chemical_structure}</span>
                      </div>
                    )}
                    {!material.chemical_formula && !material.chemical_structure && (
                      <span className="text-xs text-muted-foreground italic">Chemical data not available</span>
                    )}
                  </div>

                  {/* Section 3: Description (right after chemical structure) */}
                  {(material.ai_summary || material.uniqueness) && (
                    <div className="space-y-3">
                      {material.ai_summary && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Bot className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-semibold text-orange-600">Description</span>
                              <p className="text-sm text-foreground mt-1">{material.ai_summary}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {material.uniqueness && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-semibold text-primary">Uniqueness</span>
                              <p className="text-sm text-foreground mt-1">{material.uniqueness}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Section 4: Sectioned Properties */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Properties</span>
                    </div>

                    {Object.entries(groupedProperties).map(([category, props]) => (
                      <div key={category} className="space-y-2">
                        <h6 className="text-xs font-semibold text-primary uppercase tracking-wide">{category}</h6>
                        <div className="bg-muted/20 rounded-lg p-3 space-y-1">
                          {props.map((prop, idx) => (
                            <div 
                              key={idx}
                              className={`flex justify-between text-sm py-1 ${
                                getPropertyDifference(`properties.${prop.name}`, getComparisonData()) 
                                  ? 'bg-primary/10 px-2 rounded border border-primary/30' 
                                  : 'border-b border-border/30 last:border-0'
                              }`}
                            >
                              <span className="text-muted-foreground capitalize">{prop.name}</span>
                              <span className="text-foreground font-medium">{prop.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {Object.keys(groupedProperties).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No properties available</p>
                    )}
                  </div>

                  <Separator />

                  {/* Section 5: Sustainability Score */}
                  <div className={`rounded-lg p-4 ${getPropertyDifference('sustainability.score', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Sustainability Score</span>
                      {material.sustainability?.source === 'AI Analysis' && (
                        <Bot className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <Progress value={material.sustainability?.score || 0} className="flex-1" />
                      <span className="text-2xl font-bold text-primary">{material.sustainability?.score || 0}</span>
                    </div>
                    {material.sustainability?.justification && (
                      <p className="text-xs text-muted-foreground italic mb-2">
                        {material.sustainability.justification}
                      </p>
                    )}
                    {material.sustainability?.breakdown && (
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {Object.entries(material.sustainability.breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-foreground font-medium">{String(value)}/100</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 6: Applications */}
                  <div className={`rounded-lg p-3 ${getPropertyDifference('applications', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : ''}`}>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Applications</div>
                    <div className="flex flex-wrap gap-1">
                      {material.applications?.map((app: string) => (
                        <Badge key={app} variant="outline" className="text-xs">{app}</Badge>
                      ))}
                      {(!material.applications || material.applications.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">No applications listed</span>
                      )}
                    </div>
                  </div>

                  {/* Section 7: Production & Innovation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-lg p-3 ${getPropertyDifference('scale', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/20'}`}>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Production Scale</div>
                      <div className="text-sm text-foreground flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" />
                        {material.scale || 'N/A'}
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 ${getPropertyDifference('innovation', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/20'}`}>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Innovation Level</div>
                      <div className="text-sm text-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        {material.innovation || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Suppliers */}
                  <div className="rounded-lg p-3 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Available Suppliers</div>
                    <div className="text-sm text-foreground flex items-center gap-2">
                      <Factory className="h-4 w-4 text-primary" />
                      {material.suppliers?.length || 0} suppliers
                    </div>
                  </div>

                  {/* Section 9: Regulations */}
                  {material.regulations && material.regulations.length > 0 && (
                    <div className={`rounded-lg p-3 ${getPropertyDifference('regulations', getComparisonData()) ? 'bg-primary/10 border-2 border-primary/30' : ''}`}>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Regulations</div>
                      <div className="flex flex-wrap gap-1">
                        {material.regulations.map((reg: string) => {
                          const description = getRegulationDescription(reg);
                          return description ? (
                            <TooltipProvider key={reg}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Badge variant="outline" className="text-xs cursor-help">{reg}</Badge>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge key={reg} variant="outline" className="text-xs">{reg}</Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Highlighted sections indicate properties that differ between selected materials. 
                This helps you quickly identify key differences.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MaterialScouting;
