import { Header } from "@/components/Header";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, FileText, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your AutoSpotr platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Content Management</CardTitle>
                </div>
                <CardDescription>
                  Manage car makes, models, and media assets
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/users">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>User Management</CardTitle>
                </div>
                <CardDescription>
                  View and manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/audit-logs">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Audit Logs</CardTitle>
                </div>
                <CardDescription>
                  Review security events and system activity logs
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Admin;
