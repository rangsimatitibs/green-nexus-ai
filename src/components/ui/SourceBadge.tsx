import { Badge } from "@/components/ui/badge";
import { Database, Globe, FlaskConical, Bot, Atom } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: string;
  url?: string;
  className?: string;
}

const sourceConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  'Your Database': { icon: Database, color: 'border-green-500 text-green-600 bg-green-500/10', label: 'Local' },
  'local': { icon: Database, color: 'border-green-500 text-green-600 bg-green-500/10', label: 'Local' },
  'manual': { icon: Database, color: 'border-green-500 text-green-600 bg-green-500/10', label: 'Local' },
  'PubChem': { icon: FlaskConical, color: 'border-blue-500 text-blue-600 bg-blue-500/10', label: 'PubChem' },
  'pubchem': { icon: FlaskConical, color: 'border-blue-500 text-blue-600 bg-blue-500/10', label: 'PubChem' },
  'Materials Project': { icon: Atom, color: 'border-purple-500 text-purple-600 bg-purple-500/10', label: 'Materials Project' },
  'materials_project': { icon: Atom, color: 'border-purple-500 text-purple-600 bg-purple-500/10', label: 'Materials Project' },
  'AI Analysis': { icon: Bot, color: 'border-orange-500 text-orange-600 bg-orange-500/10', label: 'AI Generated' },
  'jarvis': { icon: Globe, color: 'border-teal-500 text-teal-600 bg-teal-500/10', label: 'JARVIS' },
};

export function SourceBadge({ source, url, className }: SourceBadgeProps) {
  const config = sourceConfig[source] || { icon: Globe, color: 'border-muted text-muted-foreground', label: source };
  const Icon = config.icon;
  
  const badge = (
    <Badge 
      variant="outline" 
      className={cn("gap-1 text-xs", config.color, className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
  
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {badge}
      </a>
    );
  }
  
  return badge;
}

export function SourcesList({ sources }: { sources: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((source, i) => (
        <SourceBadge key={i} source={source} />
      ))}
    </div>
  );
}
