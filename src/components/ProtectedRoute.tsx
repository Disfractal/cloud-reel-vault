import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

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
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
