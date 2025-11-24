import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  // Automatically check for email verification every 5 seconds
  useEffect(() => {
    if (!user || !userProfile || userProfile.emailVerified) {
      return;
    }

    const checkVerification = async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          toast({
            title: "Email verified!",
            description: "Your email has been verified. Redirecting...",
          });
          // Trigger a page reload to update the user profile
          window.location.reload();
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    // Check immediately on mount
    checkVerification();

    // Then check every 5 seconds
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [user, userProfile, toast]);

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

  const handleManualCheck = async () => {
    if (!user) return;

    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast({
          title: "Email verified!",
          description: "Your email has been verified. Redirecting...",
        });
        window.location.reload();
      } else {
        toast({
          title: "Not verified yet",
          description: "Please check your email and click the verification link.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error checking verification:", error);
      toast({
        title: "Check failed",
        description: "Could not check verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
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

  // Check if user has verified their email using Firestore profile data
  if (userProfile && !userProfile.emailVerified) {
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
            Check your inbox and click the verification link. This page will automatically refresh when you verify your email.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleManualCheck} 
              disabled={checking}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? "Checking..." : "I've Verified - Check Now"}
            </Button>
            <Button 
              onClick={handleResendVerification} 
              disabled={resending}
              variant="outline"
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
