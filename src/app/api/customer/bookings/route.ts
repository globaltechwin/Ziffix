import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

function getUserIdFromSession(session: string): string | null {
  try {
    const decoded = JSON.parse(atob(session));
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserIdFromSession(sessionCookie);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, address, scheduledDate, scheduledTime, notes } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!address || typeof address !== "string" || address.trim().length === 0) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `bk_${Date.now()}`,
      notes: {
        userId,
        itemCount: String(items.length),
        address: address.slice(0, 250),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create booking order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
