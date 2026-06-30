import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "./db";
import { generatePseudonym } from "./pseudonym";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
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
        if (!resendClient) {
          console.warn("RESEND_API_KEY not set — magic link:", url);
          return;
        }
        await resendClient.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: email,
          subject: "Tu enlace de acceso — Dev Voluntario",
          html: `<p>Haz clic para acceder a Dev Voluntario:</p><a href="${url}">${url}</a>`,
        });
      },
    }),
  ],
});
