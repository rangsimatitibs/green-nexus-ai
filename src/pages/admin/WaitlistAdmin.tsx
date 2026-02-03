import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";

interface WaitlistSignup {
  id: string;
  full_name: string | null;
  email: string;
  company_name: string | null;
  phone: string | null;
  interest_area: string | null;
  created_at: string;
}

export default function WaitlistAdmin() {
  const [signups, setSignups] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    try {
      const { data, error } = await supabase
        .from("waitlist_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSignups(data || []);
    } catch (error) {
      console.error("Error fetching waitlist signups:", error);
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Waitlist Signups</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          {signups.length} total
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {signups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No signups yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Interest Area</TableHead>
                  <TableHead>Signed Up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">
                      {signup.full_name || "-"}
                    </TableCell>
                    <TableCell>{signup.email}</TableCell>
                    <TableCell>{signup.company_name || "-"}</TableCell>
                    <TableCell>{signup.phone || "-"}</TableCell>
                    <TableCell>
                      {signup.interest_area ? (
                        <span className="text-sm">{signup.interest_area}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(signup.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
