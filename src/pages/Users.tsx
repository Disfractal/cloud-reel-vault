import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore-helpers";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  createdOn: Date;
}

const Users = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, collections.users));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdOn: doc.data().createdOn?.toDate() || new Date(),
        })) as UserProfile[];
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error loading users",
          description: "Could not fetch users from the database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Users</CardTitle>
            <p className="text-muted-foreground">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-lg text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">No users found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "No users in the system yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username || '-'}</TableCell>
                        <TableCell>
                          <span className={user.emailVerified ? "text-green-600" : "text-muted-foreground"}>
                            {user.emailVerified ? 'Verified' : 'Not verified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.createdOn.toLocaleDateString()}
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

export default Users;
