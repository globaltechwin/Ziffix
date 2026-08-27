"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wrench,
  Home,
  CreditCard,
  Crown,
  BarChart3,
  Settings,
  Search,
  CalendarCheck,
  FileText,
  Bell,
  User,
  UserCog,
  ClipboardList,
  DollarSign,
  Clock,
  Gift,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  adminNavItems,
  customerNavItems,
  technicianNavItems,
  type NavItem,
} from "@/lib/constants";
import { useAuth } from "@/context/auth-context";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Calendar,
  Wrench,
  Home,
  CreditCard,
  Crown,
  BarChart3,
  Settings,
  Search,
  CalendarCheck,
  FileText,
  Bell,
  User,
  UserCog,
  ClipboardList,
  DollarSign,
  Clock,
  Gift,
};

const portalNavItems: Record<string, NavItem[]> = {
  admin: adminNavItems,
  customer: customerNavItems,
  technician: technicianNavItems,
};

const portalLabels: Record<string, string> = {
  admin: "Admin Portal",
  customer: "Customer Portal",
  technician: "Technician Portal",
};

interface SidebarProps {
  portal: "admin" | "customer" | "technician";
  mode: "fixed" | "overlay";
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  portal,
  isOverlay,
  onClose,
}: {
  portal: "admin" | "customer" | "technician";
  isOverlay: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = portalNavItems[portal];
  const { user, signOut } = useAuth();

  const phone = user?.phone || "";
  const userName = phone ? `+91 ${phone}` : "User";
  const userInitials = phone ? phone.slice(-2).toUpperCase() : "U";

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand + Close button */}
      <div
        className="flex h-14 items-center justify-between border-b px-4"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2">
          <Home className="size-5 shrink-0 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Servly
          </span>
        </div>
        {isOverlay && onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const linkContent = (
              <Link
                href={item.href}
                onClick={isOverlay ? onClose : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={
                  isActive
                    ? { backgroundColor: "var(--sidebar-accent)" }
                    : undefined
                }
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-colors duration-150",
                      isActive ? "text-primary" : ""
                    )}
                  />
                )}
                <span>{item.title}</span>
              </Link>
            );

            return <div key={item.href}>{linkContent}</div>;
          })}
        </div>
      </nav>

      <Separator />

      {/* User Info */}
      <div className="flex items-center gap-3 px-3 py-3">
        <Avatar size="sm">
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {userName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {portalLabels[portal]}
          </span>
        </div>
        {isOverlay && onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ portal, mode, isOpen, onClose }: SidebarProps) {
  if (mode === "fixed") {
    return (
      <aside
        className="hidden h-screen w-56 flex-shrink-0 flex-col border-r lg:flex"
        style={{
          backgroundColor: "var(--sidebar)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        <SidebarContent portal={portal} isOverlay={false} />
      </aside>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{
        backgroundColor: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <SidebarContent portal={portal} isOverlay={true} onClose={onClose} />
    </div>
  );
}
