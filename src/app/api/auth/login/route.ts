import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password required" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error("LOGIN ERROR: DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { phone } });
    } catch (dbError) {
      console.error("LOGIN DB ERROR:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
