import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export enum AuditEventType {
  ADMIN_INIT_SUCCESS = "admin_init_success",
  ADMIN_INIT_FAILED_INVALID_CODE = "admin_init_failed_invalid_code",
  ADMIN_INIT_FAILED_ALREADY_EXISTS = "admin_init_failed_already_exists",
  ADMIN_INIT_FAILED_NOT_AUTHENTICATED = "admin_init_failed_not_authenticated",
  ADMIN_INIT_FAILED_ERROR = "admin_init_failed_error",
  USER_APPROVED = "user_approved",
  USER_APPROVAL_REVOKED = "user_approval_revoked",
}

export interface AuditLog {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: string;
  success: boolean;
}

const AUDIT_LOGS_COLLECTION = "security_audit_logs";

/**
 * Log a security audit event
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  userId: string | undefined,
  userEmail: string | undefined,
  success: boolean,
  details?: string
): Promise<void> {
  try {
    const auditLog: AuditLog = {
      eventType,
      userId,
      userEmail,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      details,
      success,
    };

    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), auditLog);
    
    console.log(`[Security Audit] ${eventType}:`, {
      userId,
      userEmail,
      success,
      details,
    });
  } catch (error) {
    // Don't throw error, just log it - audit logging shouldn't break the app
    console.error("Error logging audit event:", error);
  }
}

/**
 * Log successful admin initialization
 */
export async function logAdminInitSuccess(userId: string, userEmail: string): Promise<void> {
  await logAuditEvent(
    AuditEventType.ADMIN_INIT_SUCCESS,
    userId,
    userEmail,
    true,
    "Admin role successfully initialized"
  );
}

/**
 * Log failed admin initialization - invalid code
 */
export async function logAdminInitFailedInvalidCode(
  userId: string | undefined,
  userEmail: string | undefined
): Promise<void> {
  await logAuditEvent(
    AuditEventType.ADMIN_INIT_FAILED_INVALID_CODE,
    userId,
    userEmail,
    false,
    "Invalid secret code provided"
  );
}

/**
 * Log failed admin initialization - admin already exists
 */
export async function logAdminInitFailedAlreadyExists(
  userId: string | undefined,
  userEmail: string | undefined
): Promise<void> {
  await logAuditEvent(
    AuditEventType.ADMIN_INIT_FAILED_ALREADY_EXISTS,
    userId,
    userEmail,
    false,
    "Admin already exists in the system"
  );
}

/**
 * Log failed admin initialization - not authenticated
 */
export async function logAdminInitFailedNotAuthenticated(): Promise<void> {
  await logAuditEvent(
    AuditEventType.ADMIN_INIT_FAILED_NOT_AUTHENTICATED,
    undefined,
    undefined,
    false,
    "User not authenticated"
  );
}

/**
 * Log failed admin initialization - error
 */
export async function logAdminInitFailedError(
  userId: string | undefined,
  userEmail: string | undefined,
  errorMessage: string
): Promise<void> {
  await logAuditEvent(
    AuditEventType.ADMIN_INIT_FAILED_ERROR,
    userId,
    userEmail,
    false,
    `Error during initialization: ${errorMessage}`
  );
}

/**
 * Log user approval
 */
export async function logUserApproved(
  targetUserId: string,
  targetUserEmail: string,
  adminUserId: string,
  adminEmail: string
): Promise<void> {
  await logAuditEvent(
    AuditEventType.USER_APPROVED,
    adminUserId,
    adminEmail,
    true,
    `User ${targetUserEmail} (${targetUserId}) approved by admin`
  );
}

/**
 * Log user approval revocation
 */
export async function logUserApprovalRevoked(
  targetUserId: string,
  targetUserEmail: string,
  adminUserId: string,
  adminEmail: string
): Promise<void> {
  await logAuditEvent(
    AuditEventType.USER_APPROVAL_REVOKED,
    adminUserId,
    adminEmail,
    true,
    `User ${targetUserEmail} (${targetUserId}) approval revoked by admin`
  );
}
