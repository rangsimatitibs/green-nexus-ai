import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Plus, Search, Filter } from 'lucide-react';

interface ExcludedTerm {
  id: string;
  term: string;
  category: string;
  created_at: string;
}

const CATEGORIES = [
  'metal', 'polymer', 'ceramic', 'composite', 'natural', 'use-case',
  'consumer', 'industrial', 'property', 'form', 'generic', 'specialized', 'general'
];

export default function ExcludedTermsAdmin() {
  const [terms, setTerms] = useState<ExcludedTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('excluded_search_terms')
      .select('*')
      .order('category', { ascending: true })
      .order('term', { ascending: true });
    
    if (error) {
      toast.error('Failed to load excluded terms');
      console.error(error);
    } else {
      setTerms(data || []);
    }
    setLoading(false);
  };

  const addTerm = async () => {
    if (!newTerm.trim()) {
      toast.error('Please enter a term');
      return;
    }

    const { error } = await supabase
      .from('excluded_search_terms')
      .insert({ term: newTerm.toLowerCase().trim(), category: newCategory });

    if (error) {
      if (error.code === '23505') {
        toast.error('This term already exists');
      } else {
        toast.error('Failed to add term');
        console.error(error);
      }
    } else {
      toast.success('Term added successfully');
      setNewTerm('');
      fetchTerms();
    }
  };

  const deleteTerm = async (id: string, term: string) => {
    const { error } = await supabase
      .from('excluded_search_terms')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete term');
      console.error(error);
    } else {
      toast.success(`Deleted "${term}"`);
      fetchTerms();
    }
  };

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || term.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'metal': 'bg-slate-500',
      'polymer': 'bg-blue-500',
      'ceramic': 'bg-amber-500',
      'composite': 'bg-purple-500',
      'natural': 'bg-green-500',
      'use-case': 'bg-pink-500',
      'consumer': 'bg-orange-500',
      'industrial': 'bg-gray-600',
      'property': 'bg-cyan-500',
      'form': 'bg-indigo-500',
      'generic': 'bg-red-500',
      'specialized': 'bg-teal-500',
      'general': 'bg-gray-400',
    };
    return colors[category] || 'bg-gray-400';
  };

  const termsByCategory = filteredTerms.reduce((acc, term) => {
    if (!acc[term.category]) acc[term.category] = [];
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, ExcludedTerm[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Excluded Search Terms</h1>
        <p className="text-muted-foreground mt-1">
          Manage terms that should be filtered out from material search results (categories and use-cases)
        </p>
      </div>

      {/* Add new term */}
      <div className="flex gap-3 p-4 bg-card border border-border rounded-lg">
        <Input
          placeholder="Enter term to exclude (e.g., 'medical')"
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTerm()}
          className="flex-1"
        />
        <Select value={newCategory} onValueChange={setNewCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addTerm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Term
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="outline" className="text-sm py-1 px-3">
          Total: {terms.length} terms
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3">
          Showing: {filteredTerms.length} terms
        </Badge>
      </div>

      {/* Terms table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Term</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTerms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No terms found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTerms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.term}</TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(term.category)} text-white`}>
                        {term.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTerm(term.id, term.term)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Category summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(termsByCategory).map(([category, categoryTerms]) => (
          <div key={category} className="p-3 bg-card border border-border rounded-lg">
            <Badge className={`${getCategoryColor(category)} text-white mb-2`}>
              {category}
            </Badge>
            <p className="text-2xl font-bold text-foreground">{categoryTerms.length}</p>
            <p className="text-xs text-muted-foreground">terms</p>
          </div>
        ))}
      </div>
    </div>
  );
}
