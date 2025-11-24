import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addUserRole, UserRole } from "@/lib/roles";
import {
  logAdminInitSuccess,
  logAdminInitFailedInvalidCode,
  logAdminInitFailedAlreadyExists,
  logAdminInitFailedNotAuthenticated,
  logAdminInitFailedError,
} from "@/lib/security-audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Shield, Lock, CheckCircle } from "lucide-react";

// SECURITY NOTE: Change this secret code before deploying to production
// After creating the first admin, this page should be removed or disabled
const ADMIN_SETUP_SECRET = "AUTOSPOTR_INIT_ADMIN_2024";

const initAdminSchema = z.object({
  secretCode: z.string().trim().min(1, { message: "Secret code is required" }),
});

const InitAdmin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [secretCode, setSecretCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [checkingExistingAdmin, setCheckingExistingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    const checkForExistingAdmin = async () => {
      try {
        // Check if any admin role exists
        const rolesSnapshot = await getDocs(
          query(collection(db, "user_roles"))
        );
        
        const hasAdmin = rolesSnapshot.docs.some(
          doc => doc.data().role === UserRole.ADMIN
        );
        
        setAdminExists(hasAdmin);
      } catch (error) {
        console.error("Error checking for existing admin:", error);
      } finally {
        setCheckingExistingAdmin(false);
      }
    };

    checkForExistingAdmin();
  }, []);

  const handleInitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      await logAdminInitFailedNotAuthenticated();
      toast({
        title: "Not authenticated",
        description: "You must be signed in to initialize admin.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Validate input
      const validated = initAdminSchema.parse({ secretCode });

      // Check secret code
      if (validated.secretCode !== ADMIN_SETUP_SECRET) {
        await logAdminInitFailedInvalidCode(user.uid, user.email || undefined);
        toast({
          title: "Invalid secret code",
          description: "The secret code you entered is incorrect.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Check again if admin exists (in case another request created one)
      const rolesSnapshot = await getDocs(
        query(collection(db, "user_roles"))
      );
      
      const hasAdmin = rolesSnapshot.docs.some(
        doc => doc.data().role === UserRole.ADMIN
      );

      if (hasAdmin) {
        await logAdminInitFailedAlreadyExists(user.uid, user.email || undefined);
        toast({
          title: "Admin already exists",
          description: "An admin has already been initialized.",
          variant: "destructive",
        });
        setAdminExists(true);
        setProcessing(false);
        return;
      }

      // Add admin role to current user
      await addUserRole(user.uid, UserRole.ADMIN);
      
      // Log successful initialization
      await logAdminInitSuccess(user.uid, user.email || "unknown");

      toast({
        title: "Admin initialized!",
        description: "You are now the administrator.",
      });

      // Redirect to users page after a short delay
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        await logAdminInitFailedError(
          user?.uid,
          user?.email || undefined,
          error.message || "Unknown error"
        );
        console.error("Error initializing admin:", error);
        toast({
          title: "Initialization failed",
          description: error.message || "Could not initialize admin. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || checkingExistingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Admin Initialization</CardTitle>
            <CardDescription>You must be signed in to initialize admin</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/auth")} 
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <CardTitle>Admin Already Initialized</CardTitle>
            <CardDescription>
              An administrator has already been set up for this system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle>Initialize Admin</CardTitle>
          <CardDescription>
            Enter the secret code to become the first administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitAdmin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="secret-code">Secret Code</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="secret-code"
                  type="password"
                  placeholder="Enter secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="pl-10"
                  required
                  disabled={processing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This secret code is configured in the application source code.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={processing}
              >
                <Shield className="h-4 w-4" />
                {processing ? "Initializing..." : "Initialize Admin"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Security Note:</strong> This page should only be used once to create the first admin. 
              After initialization, remove this page from your application for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitAdmin;
