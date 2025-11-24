import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoles, addUserRole, removeUserRole, UserRole } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, User, Calendar, CheckCircle, XCircle, Shield } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  emailVerified: boolean;
  createdOn: Date;
  updatedOn: Date;
}

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAdmin, refreshRoles } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        navigate("/users");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, collections.users, userId));
        
        if (!userDoc.exists()) {
          toast({
            title: "User not found",
            description: "The requested user does not exist.",
            variant: "destructive",
          });
          navigate("/users");
          return;
        }

        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
          createdOn: userDoc.data().createdOn?.toDate() || new Date(),
          updatedOn: userDoc.data().updatedOn?.toDate() || new Date(),
        } as UserProfile;

        setUser(userData);
        
        // Fetch user roles
        const userRoles = await getUserRoles(userId);
        setRoles(userRoles);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error loading user",
          description: "Could not fetch user details from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate, toast]);

  const handleToggleAdminRole = async () => {
    if (!userId || !user) return;

    setUpdatingRole(true);
    try {
      const isCurrentlyAdmin = roles.includes(UserRole.ADMIN);
      
      if (isCurrentlyAdmin) {
        await removeUserRole(userId, UserRole.ADMIN);
        setRoles(roles.filter(r => r !== UserRole.ADMIN));
        toast({
          title: "Admin role removed",
          description: `${user.username || user.email} is no longer an admin.`,
        });
      } else {
        await addUserRole(userId, UserRole.ADMIN);
        setRoles([...roles, UserRole.ADMIN]);
        toast({
          title: "Admin role granted",
          description: `${user.username || user.email} is now an admin.`,
        });
      }
      
      // Refresh roles in auth context
      await refreshRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "Could not update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading user details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container px-4 py-8 md:px-6 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || 'Unknown User'}
                    </CardTitle>
                    {roles.includes(UserRole.ADMIN) && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    User ID: {user.id}
                  </p>
                </div>
              </div>
              
              {isAdmin && (
                <Button
                  variant={roles.includes(UserRole.ADMIN) ? "destructive" : "default"}
                  onClick={handleToggleAdminRole}
                  disabled={updatingRole}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {updatingRole
                    ? "Updating..."
                    : roles.includes(UserRole.ADMIN)
                    ? "Remove Admin"
                    : "Make Admin"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-base">{user.username || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {user.emailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Verification</p>
                    <p className={user.emailVerified ? "text-green-600" : "text-muted-foreground"}>
                      {user.emailVerified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Joined</p>
                    <p className="text-base">
                      {user.createdOn.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-base">
                      {user.updatedOn.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDetail;
