"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { signIn } from "../../../../auth";
import { signInSchema, signUpSchema } from "@/features/auth/model/auth.schemas";
import { prisma } from "@/shared/lib/prisma";

export type AuthActionState = {
  error?: string;
};

const genericSignInError = "Invalid email or password.";
const databaseUnavailableError =
  "Database is not configured. Set DATABASE_URL and apply Prisma migrations before creating an account.";

function isDatabaseConnectionError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("Invalid URL") ||
      error.message.includes("Can't reach database") ||
      error.message.includes("Environment variable not found"))
  );
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { error: databaseUnavailableError };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/sign-in?registered=1");
    }

    throw error;
  }

  return {};
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: genericSignInError };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/today",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: genericSignInError };
    }

    throw error;
  }

  return {};
}
