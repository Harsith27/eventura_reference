import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users
 * Get all admin users (SUPERADMIN only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Only SUPERADMIN can view admin users" },
        { status: 403 }
      );
    }

    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        college: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: adminUsers,
        count: adminUsers.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get admin users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch admin users",
      },
      { status: 500 }
    );
  }
}
