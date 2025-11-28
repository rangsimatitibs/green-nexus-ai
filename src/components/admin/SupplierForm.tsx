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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: any;
  onSuccess: () => void;
}

export default function SupplierForm({ open, onOpenChange, supplier, onSuccess }: SupplierFormProps) {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    material_id: "",
    company_name: "",
    country: "",
    logo_url: "",
    product_image_url: "",
    uniqueness: "",
    pricing: "",
    min_order: "",
    lead_time: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (supplier) {
      setFormData({
        material_id: supplier.material_id || "",
        company_name: supplier.company_name || "",
        country: supplier.country || "",
        logo_url: supplier.logo_url || "",
        product_image_url: supplier.product_image_url || "",
        uniqueness: supplier.uniqueness || "",
        pricing: supplier.pricing || "",
        min_order: supplier.min_order || "",
        lead_time: supplier.lead_time || "",
      });
    } else {
      setFormData({
        material_id: "",
        company_name: "",
        country: "",
        logo_url: "",
        product_image_url: "",
        uniqueness: "",
        pricing: "",
        min_order: "",
        lead_time: "",
      });
    }
  }, [supplier, open]);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from("materials")
      .select("id, name")
      .order("name");
    setMaterials(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (supplier) {
        const { error } = await supabase
          .from("suppliers")
          .update(formData)
          .eq("id", supplier.id);

        if (error) throw error;
        toast({ title: "Success", description: "Supplier updated successfully" });
      } else {
        const { error } = await supabase.from("suppliers").insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Supplier created successfully" });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save supplier",
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
          <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="material_id">Material</Label>
            <Select
              value={formData.material_id}
              onValueChange={(value) => setFormData({ ...formData, material_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="product_image_url">Product Image URL</Label>
            <Input
              id="product_image_url"
              value={formData.product_image_url}
              onChange={(e) => setFormData({ ...formData, product_image_url: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="uniqueness">Uniqueness</Label>
            <Textarea
              id="uniqueness"
              value={formData.uniqueness}
              onChange={(e) => setFormData({ ...formData, uniqueness: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="pricing">Pricing</Label>
            <Input
              id="pricing"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="min_order">Minimum Order</Label>
            <Input
              id="min_order"
              value={formData.min_order}
              onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="lead_time">Lead Time</Label>
            <Input
              id="lead_time"
              value={formData.lead_time}
              onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : supplier ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
