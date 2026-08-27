"use client";

import { motion } from "motion/react";
import { Phone, Shield, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ProfilePage() {
  const { user } = useAuth();

  const phone = user?.phone || "";
  const name = user?.name || "User";
  const initials = phone ? phone.slice(-2).toUpperCase() : "U";
  const avatarUrl = user?.id
    ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`
    : "";

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-6 flex items-center gap-4">
            <Avatar size="lg">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <p className="text-muted-foreground">Member</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Phone className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-medium text-foreground">+91 {phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Password Reset Request */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Shield className="size-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Password</h3>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Request Password Reset
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  To reset your password, please contact your administrator.
                  They will verify your identity and reset your password.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
