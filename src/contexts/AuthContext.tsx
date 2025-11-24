import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { collections } from "@/lib/firestore-helpers";
import { getUserRoles, UserRole } from "@/lib/roles";

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  picture?: string;
  emailVerified: boolean;
  createdOn: Date;
  updatedOn: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRoles: UserRole[];
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserRoles = async (userId: string) => {
    const roles = await getUserRoles(userId);
    setUserRoles(roles);
  };

  const refreshRoles = async () => {
    if (user) {
      await loadUserRoles(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const profileDoc = await getDoc(doc(db, collections.users, user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        }
        
        // Load user roles
        await loadUserRoles(user.uid);
      } else {
        setUserProfile(null);
        setUserRoles([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, "id"> = {
      email: user.email!,
      username: username || email.split("@")[0],
      emailVerified: user.emailVerified,
      createdOn: new Date(),
      updatedOn: new Date(),
    };

    await setDoc(doc(db, collections.users, user.uid), {
      ...userProfile,
      id: user.uid,
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userProfile,
    userRoles,
    isAdmin: userRoles.includes(UserRole.ADMIN),
    loading,
    signUp,
    signIn,
    logout,
    refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
