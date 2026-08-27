import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { totalBookings: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
