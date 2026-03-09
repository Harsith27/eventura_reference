import { NextRequest, NextResponse } from "next/server";
import { loginSuperadmin } from "@/services/user.service";
import { superadminLoginSchema } from "@/lib/validations";
import { setAuthCookie, generateToken } from "@/lib/auth";

/**
 * POST /api/auth/superadmin/login
 * SUPERADMIN login with hardcoded credentials
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = superadminLoginSchema.parse(body);

    const result = await loginSuperadmin(data.username, data.password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await generateToken({
      userId: "SUPERADMIN",
      email: process.env.SUPERADMIN_EMAIL || "myprojecthub27@gmail.com",
      role: "SUPERADMIN",
      status: "ACTIVE",
      isProfileComplete: true,
    });

    // Set auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "SUPERADMIN login successful",
        data: result.data,
      },
      { status: 200 }
    );

    // Set cookie manually since setAuthCookie is async
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("SUPERADMIN login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "SUPERADMIN login failed",
      },
      { status: 500 }
    );
  }
}
