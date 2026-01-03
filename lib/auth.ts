import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { AUTH_ROUTES } from "@/lib/routes";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Reject users with unverified email - they cannot log in until verified
        // We throw an error so it can be caught and handled properly
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Allow inactive users to log in - they will be redirected appropriately in layouts
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.emailVerified = user.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (
        token &&
        session.user &&
        token.id &&
        typeof token.id === "string" &&
        token.role &&
        token.status
      ) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.emailVerified =
          (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
  },
});
