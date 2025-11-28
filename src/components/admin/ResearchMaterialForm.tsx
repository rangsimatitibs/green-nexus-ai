import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResearchMaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: any;
  onSuccess: () => void;
}

export default function ResearchMaterialForm({ open, onOpenChange, material, onSuccess }: ResearchMaterialFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "",
    institution: "",
    year: new Date().getFullYear(),
    funding_stage: "",
    contact_email: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        status: material.status || "",
        institution: material.institution || "",
        year: material.year || new Date().getFullYear(),
        funding_stage: material.funding_stage || "",
        contact_email: material.contact_email || "",
      });
    } else {
      setFormData({
        name: "",
        status: "",
        institution: "",
        year: new Date().getFullYear(),
        funding_stage: "",
        contact_email: "",
      });
    }
  }, [material, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (material) {
        const { error } = await supabase
          .from("research_materials")
          .update(formData)
          .eq("id", material.id);

        if (error) throw error;
        toast({ title: "Success", description: "Research material updated successfully" });
      } else {
        const { error } = await supabase.from("research_materials").insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Research material created successfully" });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save research material",
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
          <DialogTitle>{material ? "Edit Research Material" : "Add Research Material"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="funding_stage">Funding Stage</Label>
            <Input
              id="funding_stage"
              value={formData.funding_stage}
              onChange={(e) => setFormData({ ...formData, funding_stage: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : material ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
