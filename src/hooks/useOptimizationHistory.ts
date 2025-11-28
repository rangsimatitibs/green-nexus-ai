import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OptimizationRun {
  id: string;
  process_name: string;
  process_type: string;
  created_at: string;
  temperature: number;
  ph: number;
  agitation: number;
  substrate_concentration?: number;
  oxygen_level?: number;
  retention_time?: number;
  temp_min?: number;
  temp_max?: number;
  ph_min?: number;
  ph_max?: number;
  baseline_yield: number;
  baseline_energy: number;
  baseline_time: number;
  optimized_yield: number;
  optimized_energy: number;
  optimized_time: number;
  opt_temperature: number;
  opt_ph: number;
  opt_agitation: number;
  opt_substrate_concentration?: number;
  opt_oxygen_level?: number;
  opt_retention_time?: number;
  yield_improvement: number;
  energy_improvement: number;
  time_improvement: number;
  notes?: string;
}

export const useOptimizationHistory = () => {
  const [runs, setRuns] = useState<OptimizationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRuns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRuns([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('optimization_runs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRuns(data || []);
    } catch (error: any) {
      console.error('Error fetching optimization runs:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRun = async (runData: Omit<OptimizationRun, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save optimization runs",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('optimization_runs')
        .insert([{ ...runData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Optimization run saved successfully"
      });

      await fetchRuns();
      return data;
    } catch (error: any) {
      console.error('Error saving optimization run:', error);
      toast({
        title: "Error",
        description: "Failed to save optimization run",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteRun = async (id: string) => {
    try {
      const { error } = await supabase
        .from('optimization_runs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Optimization run deleted"
      });

      await fetchRuns();
    } catch (error: any) {
      console.error('Error deleting optimization run:', error);
      toast({
        title: "Error",
        description: "Failed to delete optimization run",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  return {
    runs,
    loading,
    saveRun,
    deleteRun,
    refetch: fetchRuns
  };
};
