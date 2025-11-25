import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: any;
  onSuccess: () => void;
}

export default function MaterialForm({ open, onOpenChange, material, onSuccess }: MaterialFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    chemical_formula: "",
    chemical_structure: "",
    uniqueness: "",
    scale: "",
    innovation: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        category: material.category || "",
        chemical_formula: material.chemical_formula || "",
        chemical_structure: material.chemical_structure || "",
        uniqueness: material.uniqueness || "",
        scale: material.scale || "",
        innovation: material.innovation || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        chemical_formula: "",
        chemical_structure: "",
        uniqueness: "",
        scale: "",
        innovation: "",
      });
    }
  }, [material, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (material) {
        const { error } = await supabase
          .from("materials")
          .update(formData)
          .eq("id", material.id);

        if (error) throw error;
        toast({ title: "Success", description: "Material updated successfully" });
      } else {
        const { error } = await supabase
          .from("materials")
          .insert(formData);

        if (error) throw error;
        toast({ title: "Success", description: "Material created successfully" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Edit Material" : "Add Material"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bio-based Polymers">Bio-based Polymers</SelectItem>
                  <SelectItem value="Composites">Composites</SelectItem>
                  <SelectItem value="Natural Materials">Natural Materials</SelectItem>
                  <SelectItem value="Recycled Materials">Recycled Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chemical_formula">Chemical Formula</Label>
            <Input
              id="chemical_formula"
              value={formData.chemical_formula}
              onChange={(e) => setFormData({ ...formData, chemical_formula: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chemical_structure">Chemical Structure</Label>
            <Textarea
              id="chemical_structure"
              value={formData.chemical_structure}
              onChange={(e) => setFormData({ ...formData, chemical_structure: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scale">Scale</Label>
              <Select
                value={formData.scale}
                onValueChange={(value) => setFormData({ ...formData, scale: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lab-scale">Lab-scale</SelectItem>
                  <SelectItem value="Pilot-scale">Pilot-scale</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniqueness">Uniqueness</Label>
              <Input
                id="uniqueness"
                value={formData.uniqueness}
                onChange={(e) => setFormData({ ...formData, uniqueness: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="innovation">Innovation</Label>
              <Input
                id="innovation"
                value={formData.innovation}
                onChange={(e) => setFormData({ ...formData, innovation: e.target.value })}
              />
            </div>
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
