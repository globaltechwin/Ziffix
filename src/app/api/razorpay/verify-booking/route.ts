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

    // Find or create a service based on the first item's service name
    const primaryItem = items[0];
    const serviceName = primaryItem?.serviceName || primaryItem?.name || "Home Service";

    let service = await prisma.service.findFirst({
      where: { name: serviceName },
    });

    if (!service) {
      // Parse duration: extract number from strings like "45 min", "2 hrs", etc.
      let durationMinutes = 120;
      if (primaryItem?.duration) {
        const parsed = parseInt(String(primaryItem.duration).replace(/\D/g, ""));
        if (!isNaN(parsed)) {
          // If the original string contains "hr" or "hrs", multiply by 60
          const durStr = String(primaryItem.duration).toLowerCase();
          durationMinutes = durStr.includes("hr") ? parsed * 60 : parsed;
        }
      }

      service = await prisma.service.create({
        data: {
          name: serviceName.length > 100 ? serviceName.slice(0, 100) : serviceName,
          description: `Booking: ${items.map((i: { name: string; quantity: number }) => `${i.name} x${i.quantity}`).join(", ")}`,
          category: "Home Services",
          basePrice: totalAmount,
          duration: durationMinutes,
          slug: serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
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

    // Increment totalBookings on the service
    await prisma.service.update({
      where: { id: service.id },
      data: { totalBookings: { increment: 1 } },
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
