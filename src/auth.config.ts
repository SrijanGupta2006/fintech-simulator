// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Notice there is NO Prisma in this file!
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;