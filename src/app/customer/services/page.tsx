"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  image?: string;
  slug?: string;
  isActive: boolean;
  rating: number;
  totalBookings: number;
}

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No services available yet.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = categoryIcons[service.category] || Grid3X3;
            const color = categoryColors[service.category] || "#6366f1";
            const slug = service.slug || service.id;

            return (
              <motion.div key={service.id} variants={item} whileHover={{ y: -4 }}>
                <Link
                  href={`/customer/services/${slug}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="relative h-36 overflow-hidden">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted">
                        <Icon className="size-10 text-muted-foreground" style={{ color }} />
                      </div>
                    )}
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">
                      {service.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>★ {service.rating}</span>
                        <span>·</span>
                        <span>{service.totalBookings} bookings</span>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        From ₹{service.basePrice}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
