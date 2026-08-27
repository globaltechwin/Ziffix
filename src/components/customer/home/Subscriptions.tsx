"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Crown, Zap, Star, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { RazorpayCheckout } from "@/components/customer/RazorpayCheckout";
import { subscriptionPlans } from "@/lib/constants";
import { toast } from "sonner";

const iconMap: Record<string, typeof Star> = { Star, Zap, Crown };
const planOrder: Record<string, number> = { free: 0, starter: 1, pro: 2 };

export function Subscriptions() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [downgrading, setDowngrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customer/subscription")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  const handleDowngrade = async (targetPlan: string) => {
    setDowngrading(targetPlan);
    try {
      const res = await fetch("/api/customer/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      if (!res.ok) {
        toast.error("Failed to change plan");
        return;
      }
      setCurrentPlan(targetPlan);
      toast.success(`Switched to ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} plan`);
    } catch {
      toast.error("Failed to change plan");
    } finally {
      setDowngrading(null);
    }
  };

  const handlePlanChanged = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Subscription Plans
        </h2>
        <Link
          href="/customer/subscriptions"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View All <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {subscriptionPlans.map((plan, i) => {
          const Icon = iconMap[plan.icon];
          const isCurrent = currentPlan === plan.id;
          const isHigher = planOrder[plan.id] > planOrder[currentPlan];
          const isLower = planOrder[plan.id] < planOrder[currentPlan];
          const isPaid = plan.id !== "free";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className={`relative flex flex-col rounded-2xl border-2 bg-card p-5 ${
                isCurrent ? "border-primary shadow-md" : plan.border
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Current Plan
                </div>
              )}

              <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${plan.bg}`}>
                <Icon className={`size-5 ${plan.color}`} />
              </div>

              <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {plan.price === 0 ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-xs text-muted-foreground">/mo</span>
                )}
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                {isCurrent ? (
                  <div className="w-full rounded-lg border border-border bg-muted py-2 text-center text-xs font-medium text-muted-foreground">
                    Current Plan
                  </div>
                ) : isLower ? (
                  <button
                    onClick={() => handleDowngrade(plan.id)}
                    disabled={downgrading === plan.id}
                    className="w-full rounded-lg border border-border bg-background py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {downgrading === plan.id ? (
                      <Loader2 className="mx-auto size-3.5 animate-spin" />
                    ) : (
                      "Downgrade"
                    )}
                  </button>
                ) : isPaid ? (
                  <RazorpayCheckout
                    plan={plan.id}
                    amount={plan.price * 100}
                    onSuccess={handlePlanChanged}
                  />
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
