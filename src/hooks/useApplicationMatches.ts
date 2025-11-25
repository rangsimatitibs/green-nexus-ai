import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationMatch {
  id: string;
  material_name: string;
  match_score: number;
  cost_category: string | null;
  strengths: string[];
  considerations: string[];
}

export const useApplicationMatches = () => {
  const [matches, setMatches] = useState<ApplicationMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: matchesData, error: matchesError } = await supabase
        .from('application_matches')
        .select('*')
        .order('match_score', { ascending: false });

      if (matchesError) throw matchesError;

      const matchesWithDetails = await Promise.all(
        (matchesData || []).map(async (match) => {
          const { data: strengthsData } = await supabase
            .from('application_match_strengths')
            .select('*')
            .eq('application_match_id', match.id);

          const strengths = strengthsData?.map((s) => s.strength) || [];

          const { data: considerationsData } = await supabase
            .from('application_match_considerations')
            .select('*')
            .eq('application_match_id', match.id);

          const considerations = considerationsData?.map((c) => c.consideration) || [];

          return {
            id: match.id,
            material_name: match.material_name,
            match_score: match.match_score,
            cost_category: match.cost_category,
            strengths,
            considerations,
          };
        })
      );

      setMatches(matchesWithDetails);
    } catch (err) {
      console.error('Error fetching application matches:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch: fetchMatches };
};
