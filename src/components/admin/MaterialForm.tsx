import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Plus, Trash2, Database, Globe, RefreshCw } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MaterialProperty {
  id?: string;
  property_name: string;
  property_value: string;
  property_category: string;
}

interface MaterialApplication {
  id?: string;
  application: string;
}

interface MaterialSynonym {
  id?: string;
  synonym: string;
  synonym_type: string;
}

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
  const [properties, setProperties] = useState<MaterialProperty[]>([]);
  const [applications, setApplications] = useState<MaterialApplication[]>([]);
  const [synonyms, setSynonyms] = useState<MaterialSynonym[]>([]);
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
      // Fetch existing properties and applications
      fetchRelatedData(material.id);
    } else {
      resetForm();
    }
    setImageFile(null);
  }, [material, open]);

  const resetForm = () => {
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
    setProperties([]);
    setApplications([]);
    setSynonyms([]);
    setImagePreview(null);
  };

  const fetchRelatedData = async (materialId: string) => {
    try {
      const [propsRes, appsRes, synsRes] = await Promise.all([
        supabase.from("material_properties").select("*").eq("material_id", materialId),
        supabase.from("material_applications").select("*").eq("material_id", materialId),
        supabase.from("material_synonyms").select("*").eq("material_id", materialId),
      ]);

      if (propsRes.data) setProperties(propsRes.data);
      if (appsRes.data) setApplications(appsRes.data);
      if (synsRes.data) setSynonyms(synsRes.data.map(s => ({ id: s.id, synonym: s.synonym, synonym_type: s.synonym_type || 'alias' })));
    } catch (error) {
      console.error("Error fetching related data:", error);
    }
  };

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

  // Property management
  const addProperty = () => {
    setProperties([...properties, { property_name: "", property_value: "", property_category: "Physical" }]);
  };

  const updateProperty = (index: number, field: keyof MaterialProperty, value: string) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    setProperties(updated);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  // Application management
  const addApplication = () => {
    setApplications([...applications, { application: "" }]);
  };

  const updateApplication = (index: number, value: string) => {
    const updated = [...applications];
    updated[index] = { ...updated[index], application: value };
    setApplications(updated);
  };

  const removeApplication = (index: number) => {
    setApplications(applications.filter((_, i) => i !== index));
  };

  // Synonym management
  const addSynonym = () => {
    setSynonyms([...synonyms, { synonym: "", synonym_type: "alias" }]);
  };

  const updateSynonym = (index: number, field: keyof MaterialSynonym, value: string) => {
    const updated = [...synonyms];
    updated[index] = { ...updated[index], [field]: value };
    setSynonyms(updated);
  };

  const removeSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index));
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

      let materialId = material?.id;

      if (material) {
        const { error } = await supabase
          .from("materials")
          .update(dataToSave)
          .eq("id", material.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("materials")
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        materialId = data.id;
      }

      // Save properties - delete existing and insert new
      if (materialId) {
        await supabase.from("material_properties").delete().eq("material_id", materialId);
        if (properties.length > 0) {
          const propsToInsert = properties
            .filter(p => p.property_name && p.property_value)
            .map(p => ({
              material_id: materialId,
              property_name: p.property_name,
              property_value: p.property_value,
              property_category: p.property_category || "Physical",
            }));
          if (propsToInsert.length > 0) {
            const { error: propsError } = await supabase.from("material_properties").insert(propsToInsert);
            if (propsError) throw propsError;
          }
        }

        // Save applications - delete existing and insert new
        await supabase.from("material_applications").delete().eq("material_id", materialId);
        if (applications.length > 0) {
          const appsToInsert = applications
            .filter(a => a.application)
            .map(a => ({
              material_id: materialId,
              application: a.application,
            }));
          if (appsToInsert.length > 0) {
            const { error: appsError } = await supabase.from("material_applications").insert(appsToInsert);
            if (appsError) throw appsError;
          }
        }

        // Save synonyms - delete existing and insert new
        await supabase.from("material_synonyms").delete().eq("material_id", materialId);
        if (synonyms.length > 0) {
          const synsToInsert = synonyms
            .filter(s => s.synonym)
            .map(s => ({
              material_id: materialId,
              synonym: s.synonym,
              synonym_type: s.synonym_type || "alias",
            }));
          if (synsToInsert.length > 0) {
            const { error: synsError } = await supabase.from("material_synonyms").insert(synsToInsert);
            if (synsError) throw synsError;
          }
        }
      }

      toast({ title: "Success", description: material ? "Material updated successfully" : "Material created successfully" });
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{material ? "Edit Material" : "Add Material"}</DialogTitle>
            {material?.data_source && material.data_source !== 'manual' && (
              <Badge variant="secondary" className="gap-1">
                {material.data_source === 'pubchem' ? (
                  <>
                    <Globe className="h-3 w-3" />
                    PubChem (CID: {material.external_id})
                  </>
                ) : (
                  <>
                    <Database className="h-3 w-3" />
                    {material.data_source}
                  </>
                )}
              </Badge>
            )}
          </div>
          {material?.last_synced_at && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(material.last_synced_at).toLocaleDateString()}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
              <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="synonyms">Synonyms ({synonyms.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="properties" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label>Material Properties</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProperty}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
              
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No properties added. Click "Add Property" to start.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {properties.map((prop, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-3 space-y-1">
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={prop.property_category}
                              onValueChange={(value) => updateProperty(index, "property_category", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Physical">Physical</SelectItem>
                                <SelectItem value="Mechanical">Mechanical</SelectItem>
                                <SelectItem value="Thermal">Thermal</SelectItem>
                                <SelectItem value="Chemical">Chemical</SelectItem>
                                <SelectItem value="Optical">Optical</SelectItem>
                                <SelectItem value="Environmental">Environmental</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Property Name</Label>
                            <Input
                              placeholder="e.g., Tensile Strength"
                              value={prop.property_name}
                              onChange={(e) => updateProperty(index, "property_name", e.target.value)}
                            />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input
                              placeholder="e.g., 50-70 MPa"
                              value={prop.property_value}
                              onChange={(e) => updateProperty(index, "property_value", e.target.value)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProperty(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label>Material Applications</Label>
                <Button type="button" variant="outline" size="sm" onClick={addApplication}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Application
                </Button>
              </div>
              
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No applications added. Click "Add Application" to start.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {applications.map((app, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex gap-3 items-center">
                          <Input
                            placeholder="e.g., Packaging, Automotive, Textiles"
                            value={app.application}
                            onChange={(e) => updateApplication(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeApplication(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="synonyms" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label>Material Synonyms</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add alternative names, abbreviations, or chemical formulas (e.g., PLA, polylactic acid)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSynonym}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Synonym
                </Button>
              </div>
              
              {synonyms.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No synonyms added. Click "Add Synonym" to help users find this material by different names.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {synonyms.map((syn, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-7 space-y-1">
                            <Label className="text-xs">Synonym/Alias</Label>
                            <Input
                              placeholder="e.g., PLA, polylactic acid, (C3H4O2)n"
                              value={syn.synonym}
                              onChange={(e) => updateSynonym(index, "synonym", e.target.value)}
                            />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={syn.synonym_type}
                              onValueChange={(value) => updateSynonym(index, "synonym_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="alias">Alias</SelectItem>
                                <SelectItem value="abbreviation">Abbreviation</SelectItem>
                                <SelectItem value="formula">Chemical Formula</SelectItem>
                                <SelectItem value="iupac">IUPAC Name</SelectItem>
                                <SelectItem value="trade_name">Trade Name</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSynonym(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
