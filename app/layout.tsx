import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZINE — Browser Zine Builder",
  description: "Make a zine in your browser. Pick a layout, choose your ink colors, edit the text, and print.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>{children}</body>
    </html>
  );
}
