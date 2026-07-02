import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const input = (credentials.username as string).trim();
        // Gérant : se connecte avec son email · Moniteur : avec son identifiant
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username: input }, { email: input.toLowerCase() }],
          },
          include: { autoEcole: true },
        });

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.username,
          role: user.role,
          emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
          autoEcoleId: user.autoEcoleId,
          autoEcoleName: user.autoEcole.name,
          autoEcoleIsActive: user.autoEcole.isActive,
          autoEcoleTrialEndsAt: user.autoEcole.trialEndsAt.toISOString(),
        } as Record<string, unknown> as import("next-auth").User;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role;
        token.emailVerified = (user as Record<string, unknown>).emailVerified;
        token.autoEcoleId = (user as Record<string, unknown>).autoEcoleId;
        token.autoEcoleName = (user as Record<string, unknown>).autoEcoleName;
        token.autoEcoleIsActive = (user as Record<string, unknown>).autoEcoleIsActive;
        token.autoEcoleTrialEndsAt = (user as Record<string, unknown>).autoEcoleTrialEndsAt;
        token.username = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.role = token.role;
        u.emailVerified = token.emailVerified;
        u.autoEcoleId = token.autoEcoleId;
        u.autoEcoleName = token.autoEcoleName;
        u.autoEcoleIsActive = token.autoEcoleIsActive;
        u.autoEcoleTrialEndsAt = token.autoEcoleTrialEndsAt;
        u.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
