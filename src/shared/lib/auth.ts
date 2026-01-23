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

// Determine the base URL for auth - support Vercel preview deployments
const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:8000";
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getBaseURL(),
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Create default lists for new user
            const defaultLists = [
              { name: 'Work', userId: user.id, isDefault: true },
              { name: 'Personal', userId: user.id, isDefault: true }
            ];
            await DB.insert(schema.listsTable).values(defaultLists);
          } catch (error) {
            console.error('Failed to create default lists:', error);
          }
        }
      }
    }
  },
});

export type Session = typeof auth.$Infer.Session;