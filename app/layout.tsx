import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALTITUDE — A higher perspective",
  description: "Explore a concept helicopter in an immersive, scroll-driven 3D rooftop experience.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
