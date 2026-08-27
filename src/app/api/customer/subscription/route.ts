import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserIdFromSession(session: string): string | null {
  try {
    const decoded = JSON.parse(atob(session));
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ plan: "free" });
    }

    const userId = getUserIdFromSession(sessionCookie);
    if (!userId) {
      return NextResponse.json({ plan: "free" });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true, endDate: true },
    });

    if (!subscription || subscription.status !== "active") {
      return NextResponse.json({ plan: "free" });
    }

    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({ plan: subscription.plan });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getUserIdFromSession(sessionCookie);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !["free", "starter", "pro"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const existing = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, endDate: true },
    });

    if (plan === "free") {
      if (!existing) {
        return NextResponse.json({ plan: "free" });
      }
      return NextResponse.json({
        plan: "free",
        scheduled: true,
        endDate: existing.endDate,
        message: existing.endDate
          ? `Your ${existing.plan} plan remains active until ${new Date(existing.endDate).toLocaleDateString("en-IN")}. After that, you'll be on the Free plan.`
          : "Downgraded to Free plan.",
      });
    }

    if (existing) {
      // Only allow downgrades via PATCH (upgrades go through Razorpay)
      const planOrder: Record<string, number> = { free: 0, starter: 1, pro: 2 };
      if (planOrder[plan] > planOrder[existing.plan]) {
        return NextResponse.json({ error: "Upgrades require payment" }, { status: 400 });
      }

      const updated = await prisma.subscription.update({
        where: { userId },
        data: { plan, status: "active", amount: plan === "starter" ? 499 : plan === "pro" ? 999 : 0 },
      });
      return NextResponse.json({ plan: updated.plan });
    }

    // Only allow creating a free subscription directly
    if (plan !== "free") {
      return NextResponse.json({ error: "Upgrades require payment" }, { status: 400 });
    }

    const created = await prisma.subscription.create({
      data: { userId, plan, status: "active", amount: 0 },
    });
    return NextResponse.json({ plan: created.plan });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
