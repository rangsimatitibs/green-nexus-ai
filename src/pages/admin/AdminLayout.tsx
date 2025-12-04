import { Link, Outlet, useLocation } from "react-router-dom";
import { Database, Beaker, Package, FileText, LayoutDashboard, LogOut, Server, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const yourDataNavigation = [
  { name: "Materials", href: "/admin/materials", icon: Database },
  { name: "Suppliers", href: "/admin/suppliers", icon: Package },
  { name: "Research Materials", href: "/admin/research-materials", icon: Beaker },
  { name: "Lab Recipes", href: "/admin/lab-recipes", icon: FileText },
];

const externalSources = [
  { name: "PubChem", status: "Connected" },
  { name: "MakeItFrom", status: "Connected" },
  { name: "AI Analysis", status: "Active" },
];

export default function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">MateriaLink</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-6">
          {/* Dashboard */}
          <div>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </div>

          <Separator />

          {/* Your Data Section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <Server className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Your Data
              </span>
            </div>
            <div className="space-y-1">
              {yourDataNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* External Sources Section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                External Sources
              </span>
            </div>
            <div className="space-y-1">
              {externalSources.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground"
                >
                  <span>{source.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{source.status}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}