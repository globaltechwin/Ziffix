"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pageTitles } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { serviceDetails } from "@/data/serviceDetails";

interface NavbarProps {
  portal: "admin" | "customer" | "technician";
  onMenuToggle: () => void;
}

export function Navbar({ portal, onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pageTitle = pageTitles[pathname] || "Dashboard";

  const phone = user?.phone || "";
  const maskedPhone = phone ? `+91 ${phone.slice(0, 5)}****` : "User";
  const initials = phone ? phone.slice(-2).toUpperCase() : "U";
  const avatarUrl = user?.id
    ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`
    : "";

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const filtered = query.trim()
    ? serviceDetails.filter(
        (s) =>
          s.isActive &&
          (s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelect = (slug: string) => {
    setQuery("");
    setSearchOpen(false);
    router.push(`/${portal}/services/${slug}`);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <img src="/logo.png" alt="Servly" className="h-12 w-auto" />
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">{pageTitle}</span>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="size-5" />
          </Button>

          {searchOpen ? (
            <div className="flex items-center gap-1">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                className="w-40 rounded-md border bg-muted/50 px-2 py-1 text-sm outline-none placeholder:text-muted-foreground sm:w-56"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-4" />
              </Button>

              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="size-4" />
                <span className="absolute right-1 top-1 flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                    />
                  }
                >
                  <Avatar size="sm">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{maskedPhone}</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(`/${portal}/profile`)}
                  >
                    <User className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {searchOpen && filtered.length > 0 && (
        <div className="border-t bg-background px-4 py-2 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-lg border bg-background shadow-md">
              {filtered.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSelect(s.slug)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="size-8 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {searchOpen && query.trim() && filtered.length === 0 && (
        <div className="border-t bg-background px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
            No services found for &quot;{query}&quot;
          </div>
        </div>
      )}
    </header>
  );
}
