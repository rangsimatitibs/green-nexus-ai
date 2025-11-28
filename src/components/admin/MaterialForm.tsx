import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";
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
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        image_url: material.image_url || "",
      });
      if (material.image_url) {
        setImagePreview(material.image_url);
      }
    } else {
      setFormData({
        name: "",
        category: "",
        chemical_formula: "",
        chemical_structure: "",
        uniqueness: "",
        scale: "",
        innovation: "",
        image_url: "",
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [material, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Image must be less than 20MB",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('material-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      const dataToSave = {
        ...formData,
        image_url: imageUrl || formData.image_url,
      };

      if (material) {
        const { error } = await supabase
          .from("materials")
          .update(dataToSave)
          .eq("id", material.id);

        if (error) throw error;
        toast({ title: "Success", description: "Material updated successfully" });
      } else {
        const { error } = await supabase
          .from("materials")
          .insert(dataToSave);

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
          <div className="space-y-2">
            <Label htmlFor="image">Material Image</Label>
            {imagePreview ? (
              <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>

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
            <Button type="submit" disabled={loading || uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? "Uploading..." : loading ? "Saving..." : material ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
