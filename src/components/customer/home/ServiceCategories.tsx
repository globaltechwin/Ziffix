"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Shirt,
  Car,
  Home,
  Wind,
  Bug,
  Zap,
  Wrench,
  Grid3X3,
  LayoutGrid,
  Loader2,
  type LucideIcon,
} from "lucide-react";

interface Service {
  id: string;
  category: string;
}

interface Category {
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
  href: string;
}

const categoryMeta: Record<string, { icon: LucideIcon; color: string }> = {
  Laundry: { icon: Shirt, color: "#8b5cf6" },
  "Car Wash": { icon: Car, color: "#3b82f6" },
  Cleaning: { icon: Home, color: "#22c55e" },
  HVAC: { icon: Wind, color: "#06b6d4" },
  "Pest Control": { icon: Bug, color: "#ef4444" },
  Electrical: { icon: Zap, color: "#f59e0b" },
  Plumbing: { icon: Wrench, color: "#3b82f6" },
};

export function ServiceCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const services: Service[] = data.services || [];
        const counts: Record<string, number> = {};
        services.forEach((s) => {
          counts[s.category] = (counts[s.category] || 0) + 1;
        });

        const cats: Category[] = Object.entries(counts).map(([name, count]) => {
          const meta = categoryMeta[name] || { icon: Grid3X3, color: "#6366f1" };
          return {
            name,
            icon: meta.icon,
            color: meta.color,
            count,
            href: "/customer/services",
          };
        });

        cats.push({
          name: "All Services",
          icon: LayoutGrid,
          color: "#6366f1",
          count: services.length,
          href: "/customer/services",
        });

        setCategories(cats.slice(0, 9));
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Browse by Category
      </h2>
      <div className="grid grid-cols-4 gap-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div key={cat.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={cat.href}
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
              >
                <div
                  className="flex size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <Icon className="size-5" style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {cat.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cat.count} services
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
