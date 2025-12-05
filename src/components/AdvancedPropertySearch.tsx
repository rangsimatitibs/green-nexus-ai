import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Search, ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Common material properties with typical units
const SUGGESTED_PROPERTIES = [
  { name: "Melting Point", unit: "°C", category: "thermal", examples: ["100-200", ">150", "<250"] },
  { name: "Tensile Strength", unit: "MPa", category: "mechanical", examples: ["50-100", ">80", "<200"] },
  { name: "Density", unit: "g/cm³", category: "physical", examples: ["0.9-1.2", "<1.0", ">2.0"] },
  { name: "Elongation at Break", unit: "%", category: "mechanical", examples: [">10", "50-100", "<5"] },
  { name: "Young's Modulus", unit: "GPa", category: "mechanical", examples: ["1-5", ">3", "<10"] },
  { name: "Glass Transition Temperature", unit: "°C", category: "thermal", examples: ["50-100", ">80", "<120"] },
  { name: "Thermal Conductivity", unit: "W/m·K", category: "thermal", examples: ["0.1-0.5", ">0.3", "<1.0"] },
  { name: "Water Absorption", unit: "%", category: "physical", examples: ["<1", "1-5", ">2"] },
  { name: "Hardness (Shore D)", unit: "", category: "mechanical", examples: ["60-80", ">70", "<50"] },
  { name: "Biodegradability", unit: "%", category: "environmental", examples: [">90", "50-100", "<30"] },
  { name: "Flexural Strength", unit: "MPa", category: "mechanical", examples: ["50-150", ">80", "<100"] },
  { name: "Impact Strength", unit: "kJ/m²", category: "mechanical", examples: [">5", "10-50", "<20"] },
  { name: "Molecular Weight", unit: "g/mol", category: "physical", examples: ["10000-50000", ">20000", "<100000"] },
  { name: "Solubility in Water", unit: "g/L", category: "physical", examples: ["<0.1", ">10", "1-100"] },
];

const INDUSTRIES = [
  { value: "packaging", label: "Packaging", description: "Food packaging, containers, films" },
  { value: "automotive", label: "Automotive", description: "Interior parts, exterior panels" },
  { value: "medical", label: "Medical", description: "Implants, devices, packaging" },
  { value: "textiles", label: "Textiles", description: "Fibers, fabrics, coatings" },
  { value: "construction", label: "Construction", description: "Insulation, pipes, panels" },
  { value: "electronics", label: "Electronics", description: "Housings, connectors, insulation" },
  { value: "agriculture", label: "Agriculture", description: "Mulch films, containers" },
  { value: "cosmetics", label: "Cosmetics", description: "Packaging, ingredients" },
];

export interface PropertyRequirement {
  property: string;
  value: string;
  unit: string;
  importance: "must-have" | "preferred" | "nice-to-have";
}

interface AdvancedPropertySearchProps {
  onSearch: (requirements: PropertyRequirement[], industry: string, application: string, additionalRequirements: string) => void;
  isSearching: boolean;
}

export const AdvancedPropertySearch = ({ onSearch, isSearching }: AdvancedPropertySearchProps) => {
  const [requirements, setRequirements] = useState<PropertyRequirement[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState("");

  const addProperty = (property: typeof SUGGESTED_PROPERTIES[0]) => {
    if (!requirements.find(r => r.property === property.name)) {
      setRequirements([...requirements, {
        property: property.name,
        value: "",
        unit: property.unit,
        importance: "must-have"
      }]);
    }
    setShowPropertySuggestions(false);
    setPropertySearchQuery("");
  };

  const removeProperty = (propertyName: string) => {
    setRequirements(requirements.filter(r => r.property !== propertyName));
  };

  const updatePropertyValue = (propertyName: string, value: string) => {
    setRequirements(requirements.map(r => 
      r.property === propertyName ? { ...r, value } : r
    ));
  };

  const updatePropertyImportance = (propertyName: string, importance: PropertyRequirement["importance"]) => {
    setRequirements(requirements.map(r => 
      r.property === propertyName ? { ...r, importance } : r
    ));
  };

  const filteredSuggestions = SUGGESTED_PROPERTIES.filter(p => 
    !requirements.find(r => r.property === p.name) &&
    (propertySearchQuery === "" || 
     p.name.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
     p.category.toLowerCase().includes(propertySearchQuery.toLowerCase()))
  );

  const handleSearch = () => {
    onSearch(requirements, selectedIndustry, applicationFilter, additionalRequirements);
  };

  const clearAll = () => {
    setRequirements([]);
    setSelectedIndustry("");
    setApplicationFilter("");
    setAdditionalRequirements("");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "thermal": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "mechanical": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "physical": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "environmental": return "bg-green-500/10 text-green-600 border-green-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-muted/30 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Smart Property Search</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Add property requirements and our AI will find materials that match. Use ranges like "100-200" or comparisons like "&gt;150".</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Property Requirements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Property Requirements</label>
          <Badge variant="outline" className="text-xs">
            {requirements.length} selected
          </Badge>
        </div>

        {/* Added Properties */}
        {requirements.length > 0 && (
          <div className="space-y-3">
            {requirements.map((req) => {
              const propInfo = SUGGESTED_PROPERTIES.find(p => p.name === req.property);
              return (
                <Card key={req.property} className="p-3 bg-background">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-foreground">{req.property}</span>
                        {req.unit && (
                          <Badge variant="outline" className="text-xs">{req.unit}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={propInfo?.examples[0] || "Enter value or range"}
                          value={req.value}
                          onChange={(e) => updatePropertyValue(req.property, e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={req.importance}
                          onChange={(e) => updatePropertyImportance(req.property, e.target.value as PropertyRequirement["importance"])}
                        >
                          <option value="must-have">Must Have</option>
                          <option value="preferred">Preferred</option>
                          <option value="nice-to-have">Nice to Have</option>
                        </select>
                      </div>
                      {propInfo && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Examples: {propInfo.examples.join(", ")}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeProperty(req.property)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Property Button & Suggestions */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setShowPropertySuggestions(!showPropertySuggestions)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property Requirement
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showPropertySuggestions ? 'rotate-180' : ''}`} />
          </Button>

          {showPropertySuggestions && (
            <Card className="absolute z-10 w-full mt-2 p-3 bg-background shadow-lg max-h-80 overflow-y-auto">
              <Input
                placeholder="Search properties..."
                value={propertySearchQuery}
                onChange={(e) => setPropertySearchQuery(e.target.value)}
                className="mb-3"
                autoFocus
              />
              
              <div className="space-y-1">
                {filteredSuggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No matching properties</p>
                ) : (
                  filteredSuggestions.map((prop) => (
                    <button
                      key={prop.name}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                      onClick={() => addProperty(prop)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{prop.name}</span>
                        <div className="flex items-center gap-2">
                          {prop.unit && (
                            <Badge variant="outline" className="text-xs">{prop.unit}</Badge>
                          )}
                          <Badge className={`text-xs ${getCategoryColor(prop.category)}`}>
                            {prop.category}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {/* Custom property input */}
              {propertySearchQuery && !SUGGESTED_PROPERTIES.find(p => 
                p.name.toLowerCase() === propertySearchQuery.toLowerCase()
              ) && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setRequirements([...requirements, {
                        property: propertySearchQuery,
                        value: "",
                        unit: "",
                        importance: "must-have"
                      }]);
                      setShowPropertySuggestions(false);
                      setPropertySearchQuery("");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add custom: "{propertySearchQuery}"
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Industry Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Target Industry</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {INDUSTRIES.map((industry) => (
            <TooltipProvider key={industry.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedIndustry === industry.value ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedIndustry(selectedIndustry === industry.value ? "" : industry.value)}
                  >
                    {industry.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{industry.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Application */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Specific Application (Optional)</label>
        <Input
          placeholder="e.g., Food packaging film, Medical implant coating..."
          value={applicationFilter}
          onChange={(e) => setApplicationFilter(e.target.value)}
        />
      </div>

      {/* Additional Requirements */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Additional Requirements (Optional)</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          placeholder="Any other requirements: certifications, processing conditions, cost constraints..."
          value={additionalRequirements}
          onChange={(e) => setAdditionalRequirements(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="flex-1"
        >
          {isSearching ? (
            "Finding Matches..."
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Find Matching Materials
            </>
          )}
        </Button>
        <Button variant="outline" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {/* Help text */}
      {requirements.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          AI will validate each result against your requirements and rank by match quality
        </p>
      )}
    </Card>
  );
};
