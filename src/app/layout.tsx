import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insurance OS",
  description: "Policy-first operating system for Medicare, life, and health agencies.",
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/households", label: "Households" },
  { href: "/policies", label: "Policies" },
  { href: "/renewals", label: "Renewals" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex h-full min-h-screen bg-slate-50 text-slate-900">
        <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <span className="text-base font-semibold">Insurance OS</span>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
