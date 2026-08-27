"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { BottomCartBar } from "@/components/customer/home/BottomCartBar";

interface ServiceDetail {
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

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.services || []).find(
          (s: ServiceDetail) => s.slug === slug || s.id === slug
        );
        if (found) {
          setService(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFoundState || !service) notFound();

  return <ServiceDetailContent service={service} slug={slug} />;
}

function ServiceDetailContent({ service, slug }: { service: ServiceDetail; slug: string }) {
  const { addItem } = useCart();

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative h-56 overflow-hidden rounded-2xl sm:h-72">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="size-full object-cover object-center"
            />
          ) : (
            <div className="size-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 className="px-4 text-2xl font-bold text-white sm:text-3xl">
              {service.name}
            </h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {service.rating}
              </span>
              <span>{service.totalBookings}+ bookings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{service.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {service.duration} min
            </span>
            <span className="flex items-center gap-1">
              ★ {service.rating}
            </span>
            <span>{service.category}</span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">₹{service.basePrice}</p>
              <p className="text-xs text-muted-foreground">Base price</p>
            </div>
            <Button
              onClick={() =>
                addItem(
                  {
                    id: service.id,
                    name: service.name,
                    price: service.basePrice,
                    originalPrice: service.basePrice,
                    duration: `${service.duration} min`,
                    image: service.image || "",
                    description: service.description,
                  },
                  service.name
                )
              }
            >
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/customer/services">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Browse More Services
            </Button>
          </Link>
        </div>
      </div>

      <BottomCartBar />
    </div>
  );
}
