import { Users, FileText, Database, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="container px-4 py-8">
          <p className="text-lg text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: "Browse Makes",
      description: "View and manage car makes and models",
      icon: Database,
      href: "/makes",
      color: "text-purple-500"
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/users",
      color: "text-blue-500"
    },
    {
      title: "Audit Logs",
      description: "View security and system audit logs",
      icon: FileText,
      href: "/audit-logs",
      color: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage your AutoSpotr platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} to={section.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-card ${section.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Admin;
