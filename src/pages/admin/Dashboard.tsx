import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Beaker, Package, FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RecentActivity {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    materials: 0,
    suppliers: 0,
    researchMaterials: 0,
    labRecipes: 0,
  });
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [countryData, setCountryData] = useState<{ name: string; value: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [materials, suppliers, researchMaterials, labRecipes, categoriesRes, countriesRes] = await Promise.all([
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("suppliers").select("id", { count: "exact", head: true }),
        supabase.from("research_materials").select("id", { count: "exact", head: true }),
        supabase.from("lab_recipes").select("id", { count: "exact", head: true }),
        supabase.from("materials").select("category"),
        supabase.from("suppliers").select("country"),
      ]);

      setStats({
        materials: materials.count || 0,
        suppliers: suppliers.count || 0,
        researchMaterials: researchMaterials.count || 0,
        labRecipes: labRecipes.count || 0,
      });

      // Process category data
      if (categoriesRes.data) {
        const categoryCount = categoriesRes.data.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData(Object.entries(categoryCount).map(([name, value]) => ({ name, value })));
      }

      // Process country data
      if (countriesRes.data) {
        const countryCount = countriesRes.data.reduce((acc: Record<string, number>, item) => {
          acc[item.country] = (acc[item.country] || 0) + 1;
          return acc;
        }, {});
        setCountryData(Object.entries(countryCount).map(([name, value]) => ({ name, value })).slice(0, 5));
      }

      // Fetch recent activity
      const recentMaterials = await supabase
        .from("materials")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const recentSuppliers = await supabase
        .from("suppliers")
        .select("id, company_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [
        ...(recentMaterials.data?.map(m => ({ id: m.id, name: m.name, type: "Material", created_at: m.created_at })) || []),
        ...(recentSuppliers.data?.map(s => ({ id: s.id, name: s.company_name, type: "Supplier", created_at: s.created_at })) || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.materials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Research Materials</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.researchMaterials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lab Recipes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.labRecipes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Material Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Supplier Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">{activity.type}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
