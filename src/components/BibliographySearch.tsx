import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Star, StarOff, Loader2, Filter, Calendar, Users, FileText, Quote, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BibliographyEntry {
  id?: string;
  title: string;
  authors: string[];
  abstract?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  sourceDatabase: string;
  keywords: string[];
  citationCount?: number;
  materialRelevance?: string;
  isSaved?: boolean;
}

const ACADEMIC_SOURCES = [
  'PubMed',
  'CrossRef',
  'ResearchGate',
  'Scopus',
  'MDPI',
  'Wiley',
  'Springer',
  'ScienceDirect',
  'Nature',
  'ACS Publications',
  'IOP Science',
  'arXiv',
];

const SUGGESTED_SEARCHES = [
  'biodegradable polymers synthesis',
  'carbon fiber composites mechanical properties',
  'graphene applications electronics',
  'sustainable packaging materials',
  'metal organic frameworks gas storage',
  'polymer nanocomposites thermal conductivity',
];

export const BibliographySearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BibliographyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-bibliography-search', {
        body: {
          query: searchTerm,
          sources: selectedSources,
          maxResults: 15,
          includeAI: true
        }
      });

      if (error) throw error;

      if (data?.entries) {
        setResults(data.entries);
        toast.success(`Found ${data.entries.length} research articles`);
      } else {
        toast.info('No articles found for this query');
      }
    } catch (error) {
      console.error('Bibliography search error:', error);
      toast.error('Failed to search bibliography');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleAbstract = (title: string) => {
    setExpandedAbstracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown authors';
    if (authors.length <= 3) return authors.join(', ');
    return `${authors.slice(0, 3).join(', ')} et al.`;
  };

  const formatCitation = (entry: BibliographyEntry) => {
    const parts = [];
    if (entry.authors.length > 0) {
      parts.push(entry.authors.length > 3 
        ? `${entry.authors[0]} et al.`
        : entry.authors.join(', '));
    }
    if (entry.year) parts.push(`(${entry.year})`);
    parts.push(entry.title);
    if (entry.journal) parts.push(`*${entry.journal}*`);
    if (entry.doi) parts.push(`DOI: ${entry.doi}`);
    return parts.join('. ');
  };

  const copyCitation = (entry: BibliographyEntry) => {
    navigator.clipboard.writeText(formatCitation(entry));
    toast.success('Citation copied to clipboard');
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'PubMed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'CrossRef': 'bg-green-500/20 text-green-400 border-green-500/30',
      'ResearchGate': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Scopus': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'MDPI': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Wiley': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Springer': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Nature': 'bg-red-500/20 text-red-400 border-red-500/30',
      'arXiv': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[source] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Bibliography Search
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered search across major academic databases including PubMed, CrossRef, ResearchGate, Scopus, and more.
          Find research articles, papers, and citations for materials science.
        </p>
      </div>

      {/* Search Box */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for materials, properties, synthesis methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-12 px-4"
            >
              <Filter className="w-5 h-5 mr-2" />
              Sources
            </Button>
            <Button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Source Filters */}
          <Collapsible open={showFilters}>
            <CollapsibleContent className="mt-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Filter by Academic Source
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_SOURCES.map(source => (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedSources.includes(source)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border hover:border-primary/50'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
                {selectedSources.length > 0 && (
                  <button
                    onClick={() => setSelectedSources([])}
                    className="mt-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Suggested Searches */}
          {results.length === 0 && !isLoading && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Suggested searches:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SEARCHES.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Searching academic databases...</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Found {results.length} Research Articles
            </h3>
          </div>

          <div className="grid gap-4">
            {results.map((entry, index) => (
              <Card key={`${entry.title}-${index}`} className="group hover:border-primary/30 transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Title and Source */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {entry.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {formatAuthors(entry.authors)}
                          </span>
                          {entry.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {entry.year}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getSourceColor(entry.sourceDatabase)}>
                        {entry.sourceDatabase}
                      </Badge>
                    </div>

                    {/* Journal and Citations */}
                    <div className="flex items-center gap-4 text-sm">
                      {entry.journal && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {entry.journal}
                        </span>
                      )}
                      {entry.citationCount !== undefined && entry.citationCount > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Quote className="w-4 h-4" />
                          {entry.citationCount} citations
                        </span>
                      )}
                    </div>

                    {/* Abstract */}
                    {entry.abstract && (
                      <Collapsible open={expandedAbstracts.has(entry.title)}>
                        <CollapsibleTrigger
                          onClick={() => toggleAbstract(entry.title)}
                          className="text-sm text-primary hover:underline"
                        >
                          {expandedAbstracts.has(entry.title) ? 'Hide abstract' : 'Show abstract'}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <p className="mt-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                            {entry.abstract}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Material Relevance */}
                    {entry.materialRelevance && (
                      <p className="text-sm text-primary/80 bg-primary/5 p-2 rounded border border-primary/20">
                        {entry.materialRelevance}
                      </p>
                    )}

                    {/* Keywords */}
                    {entry.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.keywords.slice(0, 5).map(keyword => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      {entry.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(entry.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Article
                        </Button>
                      )}
                      {entry.doi && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://doi.org/${entry.doi}`, '_blank')}
                        >
                          DOI
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCitation(entry)}
                      >
                        <Quote className="w-4 h-4 mr-2" />
                        Copy Citation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};
