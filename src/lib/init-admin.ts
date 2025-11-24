import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserRole } from "./roles";

/**
 * Initialize admin role for a user
 * This is a one-time utility function to bootstrap the first admin
 */
export async function initializeAdmin(userId: string) {
  try {
    await addDoc(collection(db, "user_roles"), {
      userId: userId,
      role: UserRole.ADMIN,
      createdAt: new Date(),
    });
    console.log(`Admin role added for user: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error adding admin role:", error);
    return false;
  }
}

// Run this immediately to add admin role
initializeAdmin("GnwotDqnHXg8tXjQ7QDQNlVN0Gc2").then((success) => {
  if (success) {
    console.log("✅ Admin role successfully added!");
  } else {
    console.log("❌ Failed to add admin role");
  }
});
