"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cart-context";
import { loadRazorpayScript } from "@/lib/load-razorpay";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
];

export function BookingForm({ open, onOpenChange }: BookingFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handlePay = async () => {
    if (!address.trim()) {
      toast.error("Please enter your address");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!time) {
      toast.error("Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const orderItems = items.map((item) => ({
        serviceTypeId: item.serviceType.id,
        name: item.serviceType.name,
        serviceName: item.serviceName,
        price: item.serviceType.price,
        quantity: item.quantity,
        duration: item.serviceType.duration,
      }));

      const res = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          address: address.trim(),
          scheduledDate: date,
          scheduledTime: time,
          notes: notes.trim() || null,
        }),
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
        description: `Booking — ${items.map((i) => i.serviceType.name).join(", ")}`,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/razorpay/verify-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: orderItems,
              address: address.trim(),
              scheduledDate: date,
              scheduledTime: time,
              notes: notes.trim() || null,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Booking confirmed! Payment successful.");
            clearCart();
            onOpenChange(false);
            setAddress("");
            setDate("");
            setTime("");
            setNotes("");
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
      console.error("Booking payment error:", e);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Booking Summary</p>
            <div className="mt-1 space-y-1">
              {items.map((item) => (
                <div key={item.serviceType.id} className="flex justify-between text-sm">
                  <span>{item.serviceType.name} x{item.quantity}</span>
                  <span className="font-medium">₹{item.serviceType.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
          </div>

          <div>
            <Label>Service Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDateStr}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time Slot</Label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handlePay}
            disabled={loading || items.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              `Pay ₹${totalPrice}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
