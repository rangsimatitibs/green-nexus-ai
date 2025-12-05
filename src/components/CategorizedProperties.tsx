import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { 
  categorizeProperty, 
  getCategoryConfig, 
  sortedCategories,
  PropertyCategory 
} from "@/utils/propertyCategories";

interface PropertyWithSource {
  name: string;
  value: string;
  source: string;
  source_url?: string;
  category?: PropertyCategory;
}

interface CategorizedPropertiesProps {
  properties: PropertyWithSource[];
  compact?: boolean;
}

interface GroupedProperties {
  [key: string]: PropertyWithSource[];
}

export function CategorizedProperties({ properties, compact = false }: CategorizedPropertiesProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['description', 'physical', 'safety']) // Default open categories
  );

  // Group properties by category
  const grouped: GroupedProperties = {};
  
  properties.forEach(prop => {
    const category = prop.category || categorizeProperty(prop.name);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ ...prop, category });
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const categories = sortedCategories();

  if (compact) {
    // Compact view - show only key properties from each category
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => {
          const categoryProps = grouped[cat.id];
          if (!categoryProps || categoryProps.length === 0) return null;
          
          const Icon = cat.icon;
          // Show first 2 properties from each category in compact view
          const displayProps = categoryProps.slice(0, 2);
          
          return displayProps.map((prop, idx) => (
            <Card key={`${cat.id}-${idx}`} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-3 w-3 ${cat.color}`} />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {prop.name}
                </span>
              </div>
              <div className="text-sm font-medium text-foreground truncate">
                {prop.value}
              </div>
            </Card>
          ));
        })}
      </div>
    );
  }

  // Full view with collapsible sections
  return (
    <div className="space-y-4">
      {categories.map(cat => {
        const categoryProps = grouped[cat.id];
        if (!categoryProps || categoryProps.length === 0) return null;
        
        const Icon = cat.icon;
        const isOpen = openCategories.has(cat.id);
        
        return (
          <Collapsible key={cat.id} open={isOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-3 h-auto hover:bg-muted/50"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${cat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-foreground">{cat.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoryProps.length}
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid md:grid-cols-2 gap-3 pt-2 pl-4">
                {categoryProps.map((prop, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm text-muted-foreground">
                        {prop.name}
                      </span>
                      <SourceBadge source={prop.source} url={prop.source_url} />
                    </div>
                    <div className="text-base font-semibold text-foreground break-words">
                      {prop.value}
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
