import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore-helpers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, User, Calendar, CheckCircle, XCircle } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username || 'Unknown User'}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  User ID: {user.id}
                </p>
              </div>
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
