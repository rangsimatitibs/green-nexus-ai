import { Badge } from "@/components/ui/badge";
import { Leaf, Factory, FlaskConical, Sprout, Fish, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialSourceBadgeProps {
  source: string;
  className?: string;
}

const sourceConfig: Record<string, { icon: React.ElementType; color: string }> = {
  'seaweed': { icon: Fish, color: 'border-teal-500 text-teal-600 bg-teal-500/10' },
  'algae': { icon: Fish, color: 'border-teal-500 text-teal-600 bg-teal-500/10' },
  'fungi': { icon: Sprout, color: 'border-amber-500 text-amber-600 bg-amber-500/10' },
  'mycelium': { icon: Sprout, color: 'border-amber-500 text-amber-600 bg-amber-500/10' },
  'agricultural waste': { icon: Recycle, color: 'border-green-500 text-green-600 bg-green-500/10' },
  'plant-based': { icon: Leaf, color: 'border-emerald-500 text-emerald-600 bg-emerald-500/10' },
  'cellulose': { icon: Leaf, color: 'border-emerald-500 text-emerald-600 bg-emerald-500/10' },
  'starch': { icon: Leaf, color: 'border-lime-500 text-lime-600 bg-lime-500/10' },
  'fossil fuel': { icon: Factory, color: 'border-gray-500 text-gray-600 bg-gray-500/10' },
  'petroleum': { icon: Factory, color: 'border-gray-500 text-gray-600 bg-gray-500/10' },
  'synthetic': { icon: FlaskConical, color: 'border-purple-500 text-purple-600 bg-purple-500/10' },
};

function getSourceConfig(source: string) {
  const lowerSource = source.toLowerCase();
  for (const [key, config] of Object.entries(sourceConfig)) {
    if (lowerSource.includes(key)) {
      return config;
    }
  }
  return { icon: Leaf, color: 'border-muted text-muted-foreground bg-muted/50' };
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
