import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone, password, name } = await request.json();

    if (!phone || typeof phone !== "string" || phone.length !== 10) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error("REGISTER ERROR: DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let existing;
    try {
      existing = await prisma.user.findUnique({ where: { phone } });
    } catch (dbError) {
      console.error("REGISTER DB ERROR (findUnique):", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Account already exists with this phone number" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await prisma.user.create({
        data: { phone, password: hashedPassword, name: name || null, role: "customer" },
      });
    } catch (dbError) {
      console.error("REGISTER DB ERROR (create):", dbError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    const session = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      createdAt: Date.now(),
    };

    const response = NextResponse.json({
      status: "success",
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    });

    response.cookies.set("session", btoa(JSON.stringify(session)), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
