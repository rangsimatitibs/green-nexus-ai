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
import LabRecipeForm from "@/components/admin/LabRecipeForm";

interface LabRecipe {
  id: string;
  title: string;
  source: string;
  authors?: string;
  doi?: string;
  key_findings?: string;
  highlighted_section?: string;
}

export default function LabRecipesAdmin() {
  const [recipes, setRecipes] = useState<LabRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<LabRecipe | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("lab_recipes")
        .select("*")
        .order("title");

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lab recipes",
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
        .from("lab_recipes")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lab recipe deleted successfully",
      });

      fetchRecipes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lab recipe",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()) ||
    recipe.source.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-3xl font-bold">Lab Recipes Management</h1>
        <Button onClick={() => { setSelectedRecipe(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lab Recipe
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by title or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Authors</TableHead>
            <TableHead>DOI</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium">{recipe.title}</TableCell>
              <TableCell>{recipe.source}</TableCell>
              <TableCell>{recipe.authors || "N/A"}</TableCell>
              <TableCell>{recipe.doi || "N/A"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSelectedRecipe(recipe); setShowForm(true); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(recipe.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <LabRecipeForm
        open={showForm}
        onOpenChange={setShowForm}
        recipe={selectedRecipe}
        onSuccess={() => {
          setShowForm(false);
          setSelectedRecipe(null);
          fetchRecipes();
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lab recipe.
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
