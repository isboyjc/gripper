import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gripper - DevTools for Designers",
  description:
    "A powerful browser extension designed for developers and designers. Inspect elements, pick colors, analyze typography, capture screenshots, and export assets with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
