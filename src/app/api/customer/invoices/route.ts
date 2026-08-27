import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const payments = await prisma.payment.findMany({
      where: { customerId: userId },
      include: {
        booking: {
          include: {
            service: { select: { name: true, slug: true } },
            technician: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoices = payments.map((p: any) => ({
      id: `INV-${p.id.slice(-6).toUpperCase()}`,
      paymentId: p.id,
      bookingId: p.bookingId,
      serviceName: p.booking.service.name,
      technicianName: p.booking.technician?.name || "Unassigned",
      date: p.createdAt,
      amount: p.amount,
      tax: Math.round(p.amount * 0.18),
      total: p.amount + Math.round(p.amount * 0.18),
      status: p.status,
      method: p.method,
      transactionId: p.transactionId,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
