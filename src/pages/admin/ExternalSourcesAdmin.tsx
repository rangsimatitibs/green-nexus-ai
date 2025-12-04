import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Globe, Trash2, Edit2, Save, X, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExternalSource {
  id: string;
  name: string;
  description: string | null;
  api_endpoint: string | null;
  api_key_secret_name: string | null;
  data_format: {
    type: string;
    fields: string[];
  };
  field_mapping: Record<string, string>;
  is_active: boolean;
  priority: number;
  rate_limit_per_minute: number;
  created_at: string;
  updated_at: string;
}

const DATA_FORMAT_TYPES = [
  { value: 'json', label: 'JSON API', description: 'REST API returning JSON data' },
  { value: 'html_scrape', label: 'HTML Scrape', description: 'Web scraping from HTML pages' },
  { value: 'ai_generated', label: 'AI Generated', description: 'AI-powered data generation' },
];

export default function ExternalSourcesAdmin() {
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_endpoint: '',
    api_key_secret_name: '',
    data_format_type: 'json',
    data_format_fields: '',
    field_mapping: '',
    is_active: true,
    priority: 0,
    rate_limit_per_minute: 60,
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('external_data_sources')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setSources((data || []) as ExternalSource[]);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast({
        title: "Error",
        description: "Failed to load external sources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      api_endpoint: '',
      api_key_secret_name: '',
      data_format_type: 'json',
      data_format_fields: '',
      field_mapping: '',
      is_active: true,
      priority: 0,
      rate_limit_per_minute: 60,
    });
  };

  const handleSave = async () => {
    try {
      const fieldsArray = formData.data_format_fields
        .split(',')
        .map(f => f.trim())
        .filter(f => f);

      let fieldMappingObj = {};
      try {
        if (formData.field_mapping.trim()) {
          fieldMappingObj = JSON.parse(formData.field_mapping);
        }
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Field mapping must be valid JSON",
          variant: "destructive"
        });
        return;
      }

      const sourceData = {
        name: formData.name,
        description: formData.description || null,
        api_endpoint: formData.api_endpoint || null,
        api_key_secret_name: formData.api_key_secret_name || null,
        data_format: {
          type: formData.data_format_type,
          fields: fieldsArray,
        },
        field_mapping: fieldMappingObj,
        is_active: formData.is_active,
        priority: formData.priority,
        rate_limit_per_minute: formData.rate_limit_per_minute,
      };

      if (editingId) {
        const { error } = await supabase
          .from('external_data_sources')
          .update(sourceData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Success", description: "Source updated" });
      } else {
        const { error } = await supabase
          .from('external_data_sources')
          .insert(sourceData);

        if (error) throw error;
        toast({ title: "Success", description: "Source added" });
      }

      setShowAddDialog(false);
      setEditingId(null);
      resetForm();
      fetchSources();
    } catch (error: any) {
      console.error('Error saving source:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save source",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (source: ExternalSource) => {
    setFormData({
      name: source.name,
      description: source.description || '',
      api_endpoint: source.api_endpoint || '',
      api_key_secret_name: source.api_key_secret_name || '',
      data_format_type: source.data_format?.type || 'json',
      data_format_fields: source.data_format?.fields?.join(', ') || '',
      field_mapping: JSON.stringify(source.field_mapping || {}, null, 2),
      is_active: source.is_active,
      priority: source.priority,
      rate_limit_per_minute: source.rate_limit_per_minute,
    });
    setEditingId(source.id);
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      const { error } = await supabase
        .from('external_data_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Source deleted" });
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({
        title: "Error",
        description: "Failed to delete source",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (source: ExternalSource) => {
    try {
      const { error } = await supabase
        .from('external_data_sources')
        .update({ is_active: !source.is_active })
        .eq('id', source.id);

      if (error) throw error;
      fetchSources();
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Configure external APIs and databases for material data retrieval
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingId(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Source' : 'Add External Source'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., PubChem"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Lower = higher priority</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the data source"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1/materials"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key Secret Name</Label>
                  <Input
                    value={formData.api_key_secret_name}
                    onChange={(e) => setFormData({ ...formData, api_key_secret_name: e.target.value })}
                    placeholder="e.g., PUBCHEM_API_KEY"
                  />
                  <p className="text-xs text-muted-foreground">Name of secret in Supabase</p>
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (per minute)</Label>
                  <Input
                    type="number"
                    value={formData.rate_limit_per_minute}
                    onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Format Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.data_format_type}
                  onChange={(e) => setFormData({ ...formData, data_format_type: e.target.value })}
                >
                  {DATA_FORMAT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Expected Fields</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Comma-separated list of field names from the API response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  value={formData.data_format_fields}
                  onChange={(e) => setFormData({ ...formData, data_format_fields: e.target.value })}
                  placeholder="MolecularFormula, MolecularWeight, Density"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Field Mapping (JSON)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Map API field names to your property names</p>
                        <code className="text-xs block mt-1">
                          {`{"MolecularFormula": "chemical_formula"}`}
                        </code>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={formData.field_mapping}
                  onChange={(e) => setFormData({ ...formData, field_mapping: e.target.value })}
                  placeholder='{"source_field": "target_field"}'
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingId(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.name}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'} Source
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Data Format Requirements</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>JSON API:</strong> Must return properties as key-value pairs in the response</li>
                <li><strong>HTML Scrape:</strong> Page must have structured data that can be extracted</li>
                <li><strong>AI Generated:</strong> Uses AI to generate data based on material name</li>
              </ul>
              <p className="mt-2">Field mapping allows you to normalize external field names to match your database schema.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((source) => (
          <Card key={source.id} className={!source.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    {source.description && (
                      <CardDescription>{source.description}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={source.is_active ? "default" : "secondary"}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">Priority: {source.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Format Type</p>
                  <p className="font-medium capitalize">{source.data_format?.type || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rate Limit</p>
                  <p className="font-medium">{source.rate_limit_per_minute}/min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">API Endpoint</p>
                  <p className="font-medium truncate max-w-[200px]" title={source.api_endpoint || ''}>
                    {source.api_endpoint || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fields</p>
                  <p className="font-medium">{source.data_format?.fields?.length || 0} fields</p>
                </div>
              </div>

              {source.data_format?.fields && source.data_format.fields.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Expected Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {source.data_format.fields.map((field, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={source.is_active}
                    onCheckedChange={() => handleToggleActive(source)}
                  />
                  <Label className="text-sm">Enabled</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(source)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(source.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sources.length === 0 && (
          <Card className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No external sources configured</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Source
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
