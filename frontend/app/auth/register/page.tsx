"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: () => router.push("/auth/login?registered=1"),
    onError: (err: any) => {
      const errData = err?.response?.data;
      if (errData?.email) setError("email", { message: errData.email[0] });
      if (errData?.username)
        setError("username", { message: errData.username[0] });
      else
        setError("root", { message: "Registration failed. Please try again." });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join ElectroStore today
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-3"
          >
            {[
              { name: "username" as const, label: "Username", type: "text" },
              { name: "email" as const, label: "Email", type: "email" },
              {
                name: "password" as const,
                label: "Password",
                type: "password",
              },
              {
                name: "password2" as const,
                label: "Confirm Password",
                type: "password",
              },
              {
                name: "phone" as const,
                label: "Phone (optional)",
                type: "text",
              },
            ].map(({ name, label, type }) => (
              <div key={name} className="space-y-1">
                <Label>{label}</Label>
                <Input type={type} {...register(name)} />
                {errors[name] && (
                  <p className="text-xs text-red-500">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
            {errors.root && (
              <p className="text-sm text-red-500 bg-red-50 rounded p-2">
                {errors.root.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
