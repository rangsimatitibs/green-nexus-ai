import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, Star, Loader2, Filter, Calendar, Users, FileText, Quote, Database, FolderPlus, Library, Copy, Check, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

interface BibliographyLibrary {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  entries_count?: number;
}

interface SavedEntry extends BibliographyEntry {
  library_id: string;
  notes?: string;
}

type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'BibTeX';

interface BibliographySearchProps {
  initialQuery?: string;
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

// Citation formatters
const formatCitationAPA = (entry: BibliographyEntry): string => {
  const authors = entry.authors.length > 0 
    ? entry.authors.length > 7 
      ? `${entry.authors.slice(0, 6).join(', ')}, ... ${entry.authors[entry.authors.length - 1]}`
      : entry.authors.join(', ')
    : 'Unknown';
  const year = entry.year ? `(${entry.year})` : '(n.d.)';
  const title = entry.title;
  const journal = entry.journal ? `*${entry.journal}*` : '';
  const doi = entry.doi ? `https://doi.org/${entry.doi}` : '';
  return `${authors} ${year}. ${title}. ${journal}. ${doi}`.trim();
};

const formatCitationMLA = (entry: BibliographyEntry): string => {
  const authors = entry.authors.length > 0 
    ? entry.authors.length > 3 
      ? `${entry.authors[0]}, et al.`
      : entry.authors.join(', ')
    : 'Unknown';
  const title = `"${entry.title}"`;
  const journal = entry.journal ? `*${entry.journal}*` : '';
  const year = entry.year || 'n.d.';
  return `${authors}. ${title} ${journal}, ${year}.`.trim();
};

const formatCitationChicago = (entry: BibliographyEntry): string => {
  const authors = entry.authors.length > 0 ? entry.authors.join(', ') : 'Unknown';
  const title = `"${entry.title}"`;
  const journal = entry.journal || '';
  const year = entry.year ? `(${entry.year})` : '';
  const doi = entry.doi ? `https://doi.org/${entry.doi}` : '';
  return `${authors}. ${title} ${journal} ${year}. ${doi}`.trim();
};

const formatCitationHarvard = (entry: BibliographyEntry): string => {
  const authors = entry.authors.length > 0 
    ? entry.authors.length > 3 
      ? `${entry.authors[0]} et al.`
      : entry.authors.join(', ')
    : 'Unknown';
  const year = entry.year || 'n.d.';
  const title = entry.title;
  const journal = entry.journal ? `*${entry.journal}*` : '';
  return `${authors} (${year}) '${title}', ${journal}.`.trim();
};

const formatCitationIEEE = (entry: BibliographyEntry): string => {
  const authors = entry.authors.length > 0 
    ? entry.authors.map(a => {
        const parts = a.split(' ');
        if (parts.length > 1) {
          return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
        }
        return a;
      }).join(', ')
    : 'Unknown';
  const title = `"${entry.title}"`;
  const journal = entry.journal ? `*${entry.journal}*` : '';
  const year = entry.year || 'n.d.';
  return `${authors}, ${title}, ${journal}, ${year}.`.trim();
};

const formatCitationBibTeX = (entry: BibliographyEntry): string => {
  const key = entry.authors[0]?.split(' ').pop()?.toLowerCase() || 'unknown';
  const year = entry.year || 'xxxx';
  return `@article{${key}${year},
  author = {${entry.authors.join(' and ')}},
  title = {${entry.title}},
  journal = {${entry.journal || ''}},
  year = {${year}},
  doi = {${entry.doi || ''}}
}`;
};

const formatCitation = (entry: BibliographyEntry, format: CitationFormat): string => {
  switch (format) {
    case 'APA': return formatCitationAPA(entry);
    case 'MLA': return formatCitationMLA(entry);
    case 'Chicago': return formatCitationChicago(entry);
    case 'Harvard': return formatCitationHarvard(entry);
    case 'IEEE': return formatCitationIEEE(entry);
    case 'BibTeX': return formatCitationBibTeX(entry);
    default: return formatCitationAPA(entry);
  }
};

export const BibliographySearch: React.FC<BibliographySearchProps> = ({ initialQuery }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<BibliographyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('APA');
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  
  // Library state
  const [libraries, setLibraries] = useState<BibliographyLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [libraryEntries, setLibraryEntries] = useState<SavedEntry[]>([]);
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [newLibraryDescription, setNewLibraryDescription] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  // Auto-search if initial query is provided
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Load libraries
  useEffect(() => {
    if (user) {
      loadLibraries();
    }
  }, [user]);

  const loadLibraries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bibliography_libraries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setLibraries(data);
    }
  };

  const loadLibraryEntries = async (libraryId: string) => {
    const { data, error } = await supabase
      .from('saved_bibliography_entries')
      .select('*')
      .eq('library_id', libraryId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const entries: SavedEntry[] = data.map(d => ({
        id: d.id,
        title: d.title,
        authors: d.authors || [],
        abstract: d.abstract || undefined,
        journal: d.journal || undefined,
        year: d.year || undefined,
        doi: d.doi || undefined,
        url: d.url || undefined,
        sourceDatabase: d.source_database,
        keywords: d.keywords || [],
        citationCount: d.citation_count || undefined,
        materialRelevance: d.material_relevance || undefined,
        library_id: d.library_id,
        notes: d.notes || undefined,
      }));
      setLibraryEntries(entries);
    }
  };

  const createLibrary = async () => {
    if (!user || !newLibraryName.trim()) return;

    const { data, error } = await supabase
      .from('bibliography_libraries')
      .insert({
        name: newLibraryName.trim(),
        description: newLibraryDescription.trim() || null,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create library');
      return;
    }

    toast.success(`Library "${newLibraryName}" created`);
    setLibraries(prev => [data, ...prev]);
    setNewLibraryName('');
    setNewLibraryDescription('');
    setShowCreateLibrary(false);
  };

  const deleteLibrary = async (libraryId: string) => {
    const { error } = await supabase
      .from('bibliography_libraries')
      .delete()
      .eq('id', libraryId);

    if (error) {
      toast.error('Failed to delete library');
      return;
    }

    toast.success('Library deleted');
    setLibraries(prev => prev.filter(l => l.id !== libraryId));
    if (selectedLibrary === libraryId) {
      setSelectedLibrary(null);
      setLibraryEntries([]);
    }
  };

  const saveToLibrary = async (entry: BibliographyEntry, libraryId: string) => {
    if (!user) {
      toast.error('Please log in to save articles');
      return;
    }

    const { error } = await supabase
      .from('saved_bibliography_entries')
      .insert({
        library_id: libraryId,
        title: entry.title,
        authors: entry.authors,
        abstract: entry.abstract,
        journal: entry.journal,
        year: entry.year,
        doi: entry.doi,
        url: entry.url,
        source_database: entry.sourceDatabase,
        keywords: entry.keywords,
        citation_count: entry.citationCount,
        material_relevance: entry.materialRelevance,
      });

    if (error) {
      toast.error('Failed to save article');
      return;
    }

    toast.success('Article saved to library');
    if (selectedLibrary === libraryId) {
      loadLibraryEntries(libraryId);
    }
  };

  const removeFromLibrary = async (entryId: string) => {
    const { error } = await supabase
      .from('saved_bibliography_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      toast.error('Failed to remove article');
      return;
    }

    toast.success('Article removed');
    setLibraryEntries(prev => prev.filter(e => e.id !== entryId));
  };

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

  const copyCitation = (entry: BibliographyEntry) => {
    const citation = formatCitation(entry, citationFormat);
    navigator.clipboard.writeText(citation);
    setCopiedCitation(entry.title);
    toast.success(`${citationFormat} citation copied`);
    setTimeout(() => setCopiedCitation(null), 2000);
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

  const renderEntryCard = (entry: BibliographyEntry, index: number, showSaveButton: boolean = true, showRemoveButton: boolean = false) => (
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
          <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
            {entry.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(entry.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
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
              {copiedCitation === entry.title ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {citationFormat}
            </Button>
            
            {showSaveButton && user && libraries.length > 0 && (
              <Select onValueChange={(libraryId) => saveToLibrary(entry, libraryId)}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Save
                </SelectTrigger>
                <SelectContent>
                  {libraries.map(lib => (
                    <SelectItem key={lib.id} value={lib.id}>{lib.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showRemoveButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => entry.id && removeFromLibrary(entry.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          AI-powered search across major academic databases. Save articles to your library and export citations in multiple formats.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Articles
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            My Library
            {user && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6 mt-6">
          {/* Citation Format Selector */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">Citation Format:</span>
            <Select value={citationFormat} onValueChange={(v) => setCitationFormat(v as CitationFormat)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="Harvard">Harvard</SelectItem>
                <SelectItem value="IEEE">IEEE</SelectItem>
                <SelectItem value="BibTeX">BibTeX</SelectItem>
              </SelectContent>
            </Select>
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
              {results.length === 0 && !isLoading && !initialQuery && (
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
                {results.map((entry, index) => renderEntryCard(entry, index, true, false))}
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
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6 mt-6">
          {!user ? (
            <Card className="p-8 text-center">
              <Library className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in to access your Library</h3>
              <p className="text-muted-foreground mb-4">
                Create collections to organize your research and save articles for later.
              </p>
              <Button asChild>
                <a href="/auth">Sign In</a>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              {/* Libraries Sidebar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">My Libraries</h3>
                  <Dialog open={showCreateLibrary} onOpenChange={setShowCreateLibrary}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Library</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Library Name</label>
                          <Input
                            placeholder="e.g., Seaweed-based Polymers Research"
                            value={newLibraryName}
                            onChange={(e) => setNewLibraryName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Input
                            placeholder="Brief description of this collection..."
                            value={newLibraryDescription}
                            onChange={(e) => setNewLibraryDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateLibrary(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createLibrary} disabled={!newLibraryName.trim()}>
                          Create Library
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {libraries.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No libraries yet. Create one to start organizing your research.
                      </p>
                    ) : (
                      libraries.map(lib => (
                        <Card
                          key={lib.id}
                          className={`p-3 cursor-pointer transition-all ${
                            selectedLibrary === lib.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedLibrary(lib.id);
                            loadLibraryEntries(lib.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{lib.name}</h4>
                              {lib.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {lib.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLibrary(lib.id);
                              }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Library Content */}
              <div>
                {!selectedLibrary ? (
                  <Card className="p-8 text-center h-full flex flex-col items-center justify-center">
                    <FolderPlus className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Select a library to view saved articles
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {libraries.find(l => l.id === selectedLibrary)?.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {libraryEntries.length} articles
                        </span>
                        <Select value={citationFormat} onValueChange={(v) => setCitationFormat(v as CitationFormat)}>
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APA">APA</SelectItem>
                            <SelectItem value="MLA">MLA</SelectItem>
                            <SelectItem value="Chicago">Chicago</SelectItem>
                            <SelectItem value="Harvard">Harvard</SelectItem>
                            <SelectItem value="IEEE">IEEE</SelectItem>
                            <SelectItem value="BibTeX">BibTeX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {libraryEntries.length === 0 ? (
                      <Card className="p-8 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                          No articles saved yet. Search and save articles to this library.
                        </p>
                        <Button className="mt-4" onClick={() => setActiveTab('search')}>
                          <Search className="w-4 h-4 mr-2" />
                          Search Articles
                        </Button>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {libraryEntries.map((entry, index) => renderEntryCard(entry, index, false, true))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
