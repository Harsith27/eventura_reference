import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword, generateToken } from "@/lib/auth";

export interface UserRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
  role?: "USER" | "ORGANIZER";
  collegeId?: string;
  collegeName?: string;
  organizationName?: string;
  contactNumber?: string;
  reason?: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface CreateOrganiserPayload {
  firstName: string;
  lastName: string;
  email: string;
  collegeId: string;
}

/**
 * Register a new user (USER role only)
 */
export async function registerUser(data: UserRegisterPayload) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  const role = data.role ?? "USER";

  if (role === "ORGANIZER") {
    const organizerCollegeName = data.organizationName || data.collegeName;

    if (!organizerCollegeName || !data.contactNumber || !data.reason) {
      throw new Error("Organizer college details are required");
    }

    const organizationName = organizerCollegeName;
    const contactNumber = data.contactNumber;
    const reason = data.reason;

    const organiserUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
          profileImage: data.profileImage || null,
          role: "ORGANIZER",
          status: "PENDING",
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          profileImage: true,
          isProfileComplete: true,
        },
      });

      await tx.organizerRequest.create({
        data: {
          userId: user.id,
          organizationName,
          contactNumber,
          reason,
        },
      });

      return user;
    });

    const token = await generateToken({
      userId: organiserUser.id,
      email: organiserUser.email,
      role: organiserUser.role,
      status: organiserUser.status,
      isProfileComplete: organiserUser.isProfileComplete,
    });

    return { user: organiserUser, token };
  }

  // Create user
  let resolvedCollegeId = data.collegeId || null;
  const collegeName = data.collegeName?.trim();

  if (!resolvedCollegeId && collegeName) {
    const existingCollege = await prisma.college.findFirst({
      where: {
        name: {
          equals: collegeName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingCollege) {
      resolvedCollegeId = existingCollege.id;
    } else {
      const createdCollege = await prisma.college.create({
        data: { name: collegeName },
        select: { id: true },
      });
      resolvedCollegeId = createdCollege.id;
    }
  }

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      profileImage: data.profileImage || null,
      role: "USER",
      status: "ACTIVE",
      collegeId: resolvedCollegeId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      profileImage: true,
      isProfileComplete: true,
    },
  });

  // Generate token
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isProfileComplete: user.isProfileComplete,
  });

  return { user, token };
}

/**
 * Login user with email and password
 */
export async function loginUser(data: UserLoginPayload) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      profileImage: true,
      isProfileComplete: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isValidPassword = await comparePassword(data.password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isProfileComplete: user.isProfileComplete,
  });

  const { password, ...userWithoutPassword } = user;

  // Add name field by combining firstName and lastName
  const userWithName = {
    ...userWithoutPassword,
    name: `${user.firstName} ${user.lastName}`.trim(),
  };

  return { user: userWithName, token };
}

/**
 * Create organiser (ADMIN only)
 */
export async function createOrganiser(
  data: CreateOrganiserPayload,
  adminId: string
) {
  // Verify admin exists and has ADMIN role
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can create organisers");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Generate temporary password for admin-created organisers
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await hashPassword(tempPassword);

  // Create organiser
  const organiser = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: "ORGANIZER",
      status: "ACTIVE",
      collegeId: data.collegeId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      collegeId: true,
    },
  });

  // Note: Email notification is sent separately through the approval workflow
  // For direct admin-created organisers, consider implementing email notification here

  return organiser;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      collegeId: true,
      createdAt: true,
    },
  });
}

/**
 * SUPERADMIN login (hardcoded credentials from .env)
 */
export async function loginSuperadmin(
  username: string,
  password: string
): Promise<{
  success: boolean;
  message?: string;
  data?: { id: string; username: string; role: string };
}> {
  try {
    const superadminUsername = process.env.SUPERADMIN_USERNAME;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superadminUsername || !superadminPassword) {
      throw new Error("SUPERADMIN credentials not configured");
    }

    // Direct credential check (not from DB)
    if (username !== superadminUsername || password !== superadminPassword) {
      throw new Error("Invalid SUPERADMIN credentials");
    }

    // Generate JWT token for SUPERADMIN
    const token = await generateToken({
      userId: "SUPERADMIN",
      email: process.env.SUPERADMIN_EMAIL || "myprojecthub27@gmail.com",
      role: "SUPERADMIN",
      status: "ACTIVE",
      isProfileComplete: true,
    });

    return {
      success: true,
      data: {
        id: "SUPERADMIN",
        username: superadminUsername,
        role: "SUPERADMIN",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "SUPERADMIN login failed",
    };
  }
}
