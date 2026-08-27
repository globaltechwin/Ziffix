"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  slug?: string;
  totalBookings: number;
}

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const all = data.services || [];
        setServices(all.slice(0, 3));
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Featured Services
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -2 }}
          >
            <Link
              href={`/customer/services/${service.slug || service.id}`}
              className="group relative block overflow-hidden rounded-xl border border-border"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="size-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-lg font-semibold text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-white/80">{service.category}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
