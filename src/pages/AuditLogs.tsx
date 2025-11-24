import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, XCircle, User } from "lucide-react";
import { AuditEventType } from "@/lib/security-audit";

interface AuditLog {
  id: string;
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  userAgent?: string;
  timestamp: Date;
  details?: string;
  success: boolean;
}

const AuditLogs = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Redirect non-admins
    if (!isAdmin && !loading) {
      toast({
        title: "Access denied",
        description: "You must be an administrator to view audit logs.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, loading, navigate, toast]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const logsQuery = query(
          collection(db, "security_audit_logs"),
          orderBy("timestamp", "desc"),
          limit(100)
        );
        
        const logsSnapshot = await getDocs(logsQuery);
        const logsData = logsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as AuditLog[];
        
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        toast({
          title: "Error loading logs",
          description: "Could not fetch audit logs from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [isAdmin, toast]);

  const filteredLogs = logs.filter(log => 
    log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventBadge = (log: AuditLog) => {
    if (log.success) {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Success
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  const getEventTypeLabel = (eventType: AuditEventType): string => {
    const labels: Record<AuditEventType, string> = {
      [AuditEventType.ADMIN_INIT_SUCCESS]: "Admin Init Success",
      [AuditEventType.ADMIN_INIT_FAILED_INVALID_CODE]: "Invalid Code",
      [AuditEventType.ADMIN_INIT_FAILED_ALREADY_EXISTS]: "Admin Already Exists",
      [AuditEventType.ADMIN_INIT_FAILED_NOT_AUTHENTICATED]: "Not Authenticated",
      [AuditEventType.ADMIN_INIT_FAILED_ERROR]: "Initialization Error",
      [AuditEventType.USER_APPROVED]: "User Approved",
      [AuditEventType.USER_APPROVAL_REVOKED]: "Approval Revoked",
    };
    return labels[eventType] || eventType;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Security Audit Logs</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {filteredLogs.length} {filteredLogs.length === 1 ? 'event' : 'events'} found
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-lg text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-muted-foreground">No audit logs found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "No security events have been logged yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.timestamp.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {getEventTypeLabel(log.eventType)}
                          </span>
                        </TableCell>
                        <TableCell>{getEventBadge(log)}</TableCell>
                        <TableCell>
                          {log.userEmail ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{log.userEmail}</p>
                                {log.userId && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {log.userId.substring(0, 8)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground truncate">
                            {log.details || '-'}
                          </p>
                          {log.userAgent && (
                            <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                              {log.userAgent}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuditLogs;
