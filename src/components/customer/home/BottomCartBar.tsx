"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { BookingForm } from "@/components/customer/BookingForm";

export function BottomCartBar() {
  const { items, totalItems, totalPrice, addItem, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Cart icon + items */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="size-6 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </div>
            {totalItems > 0 ? (
              <>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"} in cart
                  </p>
                  <div className="flex flex-col gap-1">
                    {items.map((item) => (
                      <div key={item.serviceType.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.serviceType.name} x{item.quantity}</span>
                        <button
                          onClick={() => removeItem(item.serviceType.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Minus className="size-3" />
                        </button>
                        <button
                          onClick={() => addItem(item.serviceType, item.serviceName)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sm:hidden">
                  <p className="text-sm font-medium text-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            )}
          </div>

          {/* Right: Total + Continue */}
          <div className="flex items-center gap-4">
            {totalItems > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-primary">₹{totalPrice}</p>
              </div>
            )}
            <Button
              size="lg"
              className="px-6 font-semibold"
              disabled={totalItems === 0}
              onClick={() => setOpen(true)}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      <BookingForm open={open} onOpenChange={setOpen} />
    </>
  );
}
