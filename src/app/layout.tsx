import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "../lib/context/CartContext";

export const metadata: Metadata = {
  title: "Thoogudeepa V2",
  description: "Restaurant Operating Suite",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full w-full flex flex-col m-0 p-0 overflow-x-hidden bg-white text-black font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
