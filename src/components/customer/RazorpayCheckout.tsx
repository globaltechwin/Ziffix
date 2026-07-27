"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadRazorpayScript } from "@/lib/load-razorpay";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

interface RazorpayCheckoutProps {
  plan: string;
  amount: number;
  onSuccess?: () => void;
}

export function RazorpayCheckout({ plan, amount, onSuccess }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const order = await res.json();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Servly",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — Monthly`,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful! Plan activated.");
            onSuccess?.();
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {},
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: Record<string, unknown>) => {
        const error = response.error as { description?: string } | undefined;
        toast.error(error?.description || "Payment failed");
        setLoading(false);
      });

      rzp.on("payment.modal.close", () => {
        setLoading(false);
      });

      rzp.open();
    } catch (e) {
      console.error("Payment error:", e);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
      {loading ? (
        <Loader2 className="mr-1 size-4 animate-spin" />
      ) : (
        `Subscribe — ₹${(amount / 100).toLocaleString("en-IN")}/mo`
      )}
    </Button>
  );
}
