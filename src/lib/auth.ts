import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins";
import { getAdminUserIds } from "./auth/rbac";
import { db } from "./db";
import * as schema from "./db/schema";
import { saveUserRecord } from "./search/sync";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    "http://localhost:4321",
    "https://blgrsptapp.vercel.app",
    "https://blgrstapp.vercel.app",
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    admin({
      adminUserIds: getAdminUserIds(),
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        async after(createdUser) {
          await saveUserRecord({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: "role" in createdUser ? String(createdUser.role ?? "user") : "user",
          });
        },
      },
    },
  },
});
