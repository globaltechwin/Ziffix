"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Home,
  Wrench,
  Zap,
  Shirt,
  Car,
  Bug,
  Thermometer,
  Grid3X3,
} from "lucide-react";
import { serviceDetails } from "@/data/serviceDetails";
import { useService } from "@/context/service-context";

const categoryIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Cleaning: Home,
  Plumbing: Wrench,
  Electrical: Zap,
  HVAC: Thermometer,
  Laundry: Shirt,
  "Car Wash": Car,
  "Pest Control": Bug,
};

const categoryColors: Record<string, string> = {
  Cleaning: "#22c55e",
  Plumbing: "#3b82f6",
  Electrical: "#f59e0b",
  HVAC: "#06b6d4",
  Laundry: "#8b5cf6",
  "Car Wash": "#3b82f6",
  "Pest Control": "#ef4444",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function CustomerServicesPage() {
  const { isServiceActive } = useService();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          All Services
        </h1>
        <p className="text-muted-foreground">
          Browse and book home services
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {serviceDetails.map((service) => {
          const Icon = categoryIcons[service.category] || Grid3X3;
          const color = categoryColors[service.category] || "#6366f1";
          const cheapestType = service.types.reduce((min, t) =>
            t.price < min.price ? t : min
          );
          const active = isServiceActive(service.slug);

          return (
            <motion.div key={service.slug} variants={item} whileHover={active ? { y: -4 } : undefined}>
              <Link
                href={active ? `/customer/services/${service.slug}` : "#"}
                onClick={(e) => { if (!active) e.preventDefault(); }}
                className={`group block overflow-hidden rounded-xl border border-border bg-card transition-shadow ${active ? "hover:shadow-md" : "opacity-60"}`}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={service.bannerImage}
                    alt={service.name}
                    className={`size-full object-cover object-center transition-transform duration-300 ${active ? "group-hover:scale-105" : "grayscale"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div
                      className="flex size-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="size-4" style={{ color }} />
                    </div>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {service.category}
                    </span>
                  </div>
                  {!active && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <p className="text-sm font-semibold text-white">Not Available</p>
                      <p className="mt-0.5 text-xs text-white/70">Check back later</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">
                    {service.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {service.types.length} options
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      From ₹{cheapestType.price}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
