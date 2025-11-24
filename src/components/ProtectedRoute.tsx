import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!user) return;

    setResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Failed to send email",
        description: error.message || "Could not send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has verified their email
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Email Verification Required</h2>
          <p className="text-muted-foreground">
            Please verify your email address to access the application. We've sent a verification link to:
          </p>
          <p className="font-medium">
            {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Check your inbox and click the verification link. Once verified, refresh this page to continue.
          </p>
          <div className="pt-4">
            <Button 
              onClick={handleResendVerification} 
              disabled={resending}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              {resending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
