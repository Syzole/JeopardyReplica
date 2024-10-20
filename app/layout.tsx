import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: "Jepordy",
  description: "A simple Jepordy game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <Providers>
          { children }
        </Providers>
      </body>
    </html>
  );
}
