"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });
  const changePwMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => authApi.changePassword(data),
    onSuccess: () => {
      reset();
      alert("Password changed successfully!");
    },
    onError: (err: any) =>
      setError("old_password", {
        message: err?.response?.data?.old_password || "Failed",
      }),
  });

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Username", value: user.username },
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phone || "—" },
                { label: "Member since", value: formatDate(user.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge>{user.role}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit((d) => changePwMutation.mutate(d))}
                className="space-y-3"
              >
                {[
                  { name: "old_password" as const, label: "Current Password" },
                  { name: "new_password" as const, label: "New Password" },
                  {
                    name: "confirm_password" as const,
                    label: "Confirm New Password",
                  },
                ].map(({ name, label }) => (
                  <div key={name} className="space-y-1">
                    <Label>{label}</Label>
                    <Input type="password" {...register(name)} />
                    {errors[name] && (
                      <p className="text-xs text-red-500">
                        {errors[name]?.message}
                      </p>
                    )}
                  </div>
                ))}
                <Button type="submit" disabled={changePwMutation.isPending}>
                  {changePwMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
