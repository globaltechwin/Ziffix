"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalAmount: number;
  notes?: string;
  service: { name: string; slug: string; category: string; image?: string };
  technician?: { name: string; phone: string };
  payment?: { amount: number; status: string; method: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Circle },
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "text-purple-600 bg-purple-50", icon: Loader2 },
  completed: { label: "Completed", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
};

const tabs = ["All", "Upcoming", "Completed", "Cancelled"] as const;

export default function CustomerBookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeTab === "All") return true;
    if (activeTab === "Upcoming") return b.status === "pending" || b.status === "confirmed" || b.status === "in_progress";
    if (activeTab === "Completed") return b.status === "completed";
    if (activeTab === "Cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Bookings
        </h1>
        <p className="text-muted-foreground">Track your booking history</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            filtered.map((booking, index) => {
              const status = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {booking.service.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.service.category} &middot; #{booking.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ₹{booking.totalAmount}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {booking.scheduledTime}
                    </span>
                    {booking.technician && (
                      <span className="flex items-center gap-1">
                        <User className="size-4" />
                        {booking.technician.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {booking.address}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
