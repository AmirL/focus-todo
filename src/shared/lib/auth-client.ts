import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = createAuthClient({
  // Use relative URL to work with any deployment domain (including Vercel previews)
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "",
});