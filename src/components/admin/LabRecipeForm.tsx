import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LabRecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: any;
  onSuccess: () => void;
}

export default function LabRecipeForm({ open, onOpenChange, recipe, onSuccess }: LabRecipeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    source: "",
    authors: "",
    doi: "",
    key_findings: "",
    highlighted_section: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || "",
        source: recipe.source || "",
        authors: recipe.authors || "",
        doi: recipe.doi || "",
        key_findings: recipe.key_findings || "",
        highlighted_section: recipe.highlighted_section || "",
      });
    } else {
      setFormData({
        title: "",
        source: "",
        authors: "",
        doi: "",
        key_findings: "",
        highlighted_section: "",
      });
    }
  }, [recipe, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (recipe) {
        const { error } = await supabase
          .from("lab_recipes")
          .update(formData)
          .eq("id", recipe.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lab recipe updated successfully" });
      } else {
        const { error } = await supabase.from("lab_recipes").insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Lab recipe created successfully" });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lab recipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Edit Lab Recipe" : "Add Lab Recipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="authors">Authors</Label>
            <Input
              id="authors"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="doi">DOI</Label>
            <Input
              id="doi"
              value={formData.doi}
              onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="key_findings">Key Findings</Label>
            <Textarea
              id="key_findings"
              value={formData.key_findings}
              onChange={(e) => setFormData({ ...formData, key_findings: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="highlighted_section">Highlighted Section</Label>
            <Textarea
              id="highlighted_section"
              value={formData.highlighted_section}
              onChange={(e) => setFormData({ ...formData, highlighted_section: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : recipe ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
