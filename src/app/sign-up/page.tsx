"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ArrowRight, Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(phone, password);
      toast.success("Account created successfully!");
      window.location.href = "/customer/home";
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-2xl font-bold text-foreground"
          >
            <Home className="size-7 text-primary" />
            Servly
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="size-8 text-primary" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Enter your phone number and create a password
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="98765 43210"
                  className="flex-1"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                "Sign Up"
              )}
              {!loading && <ArrowRight className="ml-1 size-4" />}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
