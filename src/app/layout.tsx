import type { Metadata } from "next";
import { Brawler, Roboto } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const brawler = Brawler({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-brawler",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeVVoluntario",
  description:
    "Directorio de iniciativas tecnológicas en respuesta al doblete sísmico de Venezuela",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${brawler.variable} ${roboto.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
