import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DB } from "./db";
import * as schema from "./drizzle/schema";

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

invariant(process.env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET environment variable is required");

const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days
const SESSION_REFRESH_INTERVAL = 60 * 60 * 24; // 1 day

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000",
  database: drizzleAdapter(DB, {
    provider: "mysql",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    }),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false, // Don't allow setting this via forms
      },
    },
  },
  session: {
    expiresIn: SESSION_DURATION, // 30 days (gets refreshed automatically)
    updateAge: SESSION_REFRESH_INTERVAL, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: SESSION_DURATION, // 30 days - stay logged in
    },
  },
});

export type Session = typeof auth.$Infer.Session;