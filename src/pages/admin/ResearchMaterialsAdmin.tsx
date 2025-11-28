import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ResearchMaterialForm from "@/components/admin/ResearchMaterialForm";

interface ResearchMaterial {
  id: string;
  name: string;
  status: string;
  institution: string;
  year: number;
  funding_stage?: string;
  contact_email?: string;
}

export default function ResearchMaterialsAdmin() {
  const [materials, setMaterials] = useState<ResearchMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ResearchMaterial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("research_materials")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch research materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("research_materials")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Research material deleted successfully",
      });

      fetchMaterials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete research material",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(search.toLowerCase()) ||
    material.institution.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Research Materials Management</h1>
        <Button onClick={() => { setSelectedMaterial(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Research Material
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name or institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funding Stage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMaterials.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.name}</TableCell>
              <TableCell>{material.institution}</TableCell>
              <TableCell>{material.year}</TableCell>
              <TableCell>{material.status}</TableCell>
              <TableCell>{material.funding_stage || "N/A"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSelectedMaterial(material); setShowForm(true); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResearchMaterialForm
        open={showForm}
        onOpenChange={setShowForm}
        material={selectedMaterial}
        onSuccess={() => {
          setShowForm(false);
          setSelectedMaterial(null);
          fetchMaterials();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the research material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
