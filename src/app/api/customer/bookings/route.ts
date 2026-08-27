import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

function getUser(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(atob(sessionCookie));
    return session.userId as string;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        service: { select: { name: true, slug: true, category: true, image: true } },
        technician: { select: { name: true, phone: true } },
        payment: { select: { amount: true, status: true, method: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, address, scheduledDate, scheduledTime, notes } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }
    if (!address || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      receipt: `booking_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: totalAmount * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Failed to create booking order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
