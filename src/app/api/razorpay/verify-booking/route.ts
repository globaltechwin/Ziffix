import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      scheduledDate,
      scheduledTime,
      notes,
    } = await request.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const serviceNames = items.map((item: { name: string; quantity: number }) => `${item.name} x${item.quantity}`).join(", ");

    let service = await prisma.service.findFirst({
      where: { name: serviceNames },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceNames.length > 100 ? serviceNames.slice(0, 100) : serviceNames,
          description: `Booking: ${serviceNames}`,
          category: "Home Services",
          basePrice: totalAmount,
          duration: items[0]?.duration || 120,
          slug: `booking-${Date.now()}`,
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: userId,
        serviceId: service.id,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        address,
        notes: notes || null,
        totalAmount,
        status: "confirmed",
        paymentStatus: "paid",
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        amount: totalAmount,
        method: "razorpay",
        status: "completed",
        transactionId: razorpay_payment_id,
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Verify booking payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
