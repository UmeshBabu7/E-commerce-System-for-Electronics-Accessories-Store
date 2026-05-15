"use client";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

const ROLE_COLORS: Record<string, string> = {
  admin: "destructive",
  staff: "secondary",
  customer: "outline",
};

export default function UsersPage() {
  const qc = useQueryClient();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, authLoading, router]);

  const { data: users, isLoading } = useQuery({
    queryKey: queryKeys.auth.users,
    queryFn: () => authApi.listUsers().then((r) => r.data),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      authApi.updateUser(id, { role } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.users }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      authApi.updateUser(id, { is_active } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.users }),
  });

  const usersArray = Array.isArray(users)
    ? users
    : ((users as any)?.results ?? []);

  if (authLoading) return <LoadingSpinner />;
  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersArray.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_COLORS[user.role] as any}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "success" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(v) =>
                            updateRole.mutate({ id: user.id, role: v })
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant={user.is_active ? "outline" : "default"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            toggleActive.mutate({
                              id: user.id,
                              is_active: !user.is_active,
                            })
                          }
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
