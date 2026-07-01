import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "./db";
import { generatePseudonym } from "./pseudonym";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.displayName) {
            await prisma.user.update({
              where: { id: user.id },
              data: { displayName: generatePseudonym(user.id) },
            });
          }
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const emailFrom = process.env.EMAIL_FROM;
        if (!resendClient || !emailFrom) {
          console.warn("RESEND_API_KEY or EMAIL_FROM not set — magic link:", url);
          return;
        }
        await resendClient.emails.send({
          from: emailFrom,
          to: email,
          subject: "Tu enlace de acceso — Dev Voluntario",
          html: `<p>Haz clic para acceder a Dev Voluntario:</p><a href="${url}">${url}</a>`,
        });
      },
    }),
  ],
});
