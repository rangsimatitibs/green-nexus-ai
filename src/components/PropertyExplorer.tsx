import { useState } from "react";
import { Search, Loader2, Bot, X, Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { COMMON_PROPERTY_SUGGESTIONS } from "@/utils/propertyCategories";

interface PropertyExplorerProps {
  materialName: string;
  existingProperties: Record<string, string>;
  onAddToOutput?: (property: { name: string; value: string; isAIGenerated: boolean }) => void;
}

interface ExploredProperty {
  name: string;
  value: string;
  isAIGenerated: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

export function PropertyExplorer({ materialName, existingProperties, onAddToOutput }: PropertyExplorerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exploredProperties, setExploredProperties] = useState<ExploredProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedToOutput, setAddedToOutput] = useState<Set<string>>(new Set());

  const filteredSuggestions = COMMON_PROPERTY_SUGGESTIONS.filter(
    prop => !existingProperties[prop] && 
           !exploredProperties.find(p => p.name.toLowerCase() === prop.toLowerCase()) &&
           prop.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  const fetchProperty = async (propertyName: string) => {
    // Check if already explored
    if (exploredProperties.find(p => p.name.toLowerCase() === propertyName.toLowerCase())) {
      return;
    }

    // Check if already exists in material data
    const existingKey = Object.keys(existingProperties).find(
      k => k.toLowerCase() === propertyName.toLowerCase()
    );
    if (existingKey) {
      setExploredProperties(prev => [...prev, {
        name: existingKey,
        value: existingProperties[existingKey],
        isAIGenerated: false
      }]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('ai-property-lookup', {
        body: { materialName, propertyName }
      });

      if (funcError) throw funcError;

      if (data?.value) {
        setExploredProperties(prev => [...prev, {
          name: propertyName,
          value: data.value,
          isAIGenerated: true,
          confidence: data.confidence || 'medium'
        }]);
      } else {
        setExploredProperties(prev => [...prev, {
          name: propertyName,
          value: 'Data not available',
          isAIGenerated: true,
          confidence: 'low'
        }]);
      }
    } catch (err) {
      console.error('Property lookup error:', err);
      setError('Failed to fetch property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchProperty(searchQuery.trim());
      setSearchQuery("");
    }
  };

  const removeProperty = (propertyName: string) => {
    setExploredProperties(prev => prev.filter(p => p.name !== propertyName));
  };

  const handleAddToOutput = (prop: ExploredProperty) => {
    if (onAddToOutput) {
      onAddToOutput({
        name: prop.name,
        value: prop.value,
        isAIGenerated: prop.isAIGenerated
      });
      setAddedToOutput(prev => new Set([...prev, prop.name]));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Find Additional Properties
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Explore Properties for {materialName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for a property (e.g., tensile strength)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Suggested properties:</div>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.map((prop) => (
                  <Badge
                    key={prop}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => fetchProperty(prop)}
                  >
                    {prop}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Explored Properties */}
          {exploredProperties.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Explored Properties:</div>
              {exploredProperties.map((prop) => (
                <Card key={prop.name} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">{prop.name}</span>
                        {prop.isAIGenerated && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Bot className="h-3 w-3" />
                            AI Estimated
                          </Badge>
                        )}
                        {prop.confidence && prop.isAIGenerated && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              prop.confidence === 'high' ? 'border-green-500 text-green-600' :
                              prop.confidence === 'medium' ? 'border-amber-500 text-amber-600' :
                              'border-red-500 text-red-600'
                            }`}
                          >
                            {prop.confidence} confidence
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium text-foreground">{prop.value}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {onAddToOutput && prop.value !== 'Data not available' && (
                        <Button
                          variant={addedToOutput.has(prop.name) ? "secondary" : "outline"}
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleAddToOutput(prop)}
                          disabled={addedToOutput.has(prop.name)}
                        >
                          {addedToOutput.has(prop.name) ? (
                            <>
                              <Check className="h-3 w-3" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Add to Output
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeProperty(prop.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <Bot className="h-4 w-4 inline mr-1" />
            Properties not found in our database will be estimated using AI. 
            Values marked as "AI Estimated" should be verified before use.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
