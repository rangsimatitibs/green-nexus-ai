import { Badge } from "@/components/ui/badge";
import { Leaf, Factory, FlaskConical, Sprout, Fish, Recycle, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialSourceBadgeProps {
  source: string;
  className?: string;
}

// Bio-based/natural sources - use Leaf icon with green tones
const bioBasedSources = [
  'seaweed', 'algae', 'fungi', 'mycelium', 'agricultural waste', 'plant', 'cellulose',
  'starch', 'corn', 'sugarcane', 'cassava', 'wood', 'cotton', 'bamboo', 'hemp',
  'bacterial', 'fermentation', 'bio-based', 'renewable', 'tapioca', 'potato',
  'plant fibers', 'plant-based binders', 'succinic acid'
];

// Chemical/fossil-based sources - use Flask icon with gray/purple tones
const chemicalSources = [
  'petrochemical', 'petroleum', 'fossil', 'synthetic', 'chemical', 'adipic acid',
  'petroleum-based', 'mineral'
];

function getSourceConfig(source: string): { icon: React.ElementType; color: string; type: 'bio' | 'chemical' | 'other' } {
  const lowerSource = source.toLowerCase();
  
  // Check if bio-based
  for (const bioTerm of bioBasedSources) {
    if (lowerSource.includes(bioTerm)) {
      return { icon: Leaf, color: 'border-green-500 text-green-600 bg-green-500/10', type: 'bio' };
    }
  }
  
  // Check if chemical/fossil-based
  for (const chemTerm of chemicalSources) {
    if (lowerSource.includes(chemTerm)) {
      return { icon: FlaskConical, color: 'border-slate-500 text-slate-600 bg-slate-500/10', type: 'chemical' };
    }
  }
  
  // Default - unknown source
  return { icon: Beaker, color: 'border-muted text-muted-foreground bg-muted/50', type: 'other' };
}

export function MaterialSourceBadge({ source, className }: MaterialSourceBadgeProps) {
  const config = getSourceConfig(source);
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1 text-xs", config.color, className)}
    >
      <Icon className="h-3 w-3" />
      {source}
    </Badge>
  );
}

export function MaterialSourcesList({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((source, i) => (
        <MaterialSourceBadge key={i} source={source} />
      ))}
    </div>
  );
}
