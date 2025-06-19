import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000",
});