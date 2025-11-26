import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface UserRoleDoc {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}

const USER_ROLES_COLLECTION = "user_roles";

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const rolesQuery = query(
      collection(db, USER_ROLES_COLLECTION),
      where("userId", "==", userId),
      where("role", "==", role)
    );
    const snapshot = await getDocs(rolesQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const rolesQuery = query(
      collection(db, USER_ROLES_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(rolesQuery);
    return snapshot.docs.map(doc => doc.data().role as UserRole);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
}

/**
 * Add a role to a user
 */
export async function addUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    // Check if role already exists
    const hasExistingRole = await hasRole(userId, role);
    if (hasExistingRole) {
      console.log("User already has this role");
      return;
    }

    await addDoc(collection(db, USER_ROLES_COLLECTION), {
      userId,
      role,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding user role:", error);
    throw error;
  }
}

/**
 * Remove a role from a user
 */
export async function removeUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const rolesQuery = query(
      collection(db, USER_ROLES_COLLECTION),
      where("userId", "==", userId),
      where("role", "==", role)
    );
    const snapshot = await getDocs(rolesQuery);
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, USER_ROLES_COLLECTION, docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error removing user role:", error);
    throw error;
  }
}

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, UserRole.ADMIN);
}
