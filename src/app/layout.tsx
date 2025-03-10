import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LineAuthProvider } from "@/lib/line-auth";
import { Navbar } from "@/components/ui/navbar";
import { cn } from "@/lib/utils";
import ThemeProvider from "@/components/providers/theme-provider";
import UserMenu from "@/components/UserMenu";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "しゅうちゃん食堂",
  description: "予約管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={cn(
        inter.className,
        'min-h-screen bg-background antialiased'
      )}>
        <LineAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">
                <nav className="p-4 bg-gray-100 flex justify-between items-center">
                  <ul className="flex space-x-4">
                    <li>
                      <Link href="/" className="text-blue-500 hover:underline">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/button-demo" className="text-blue-500 hover:underline">
                        ボタンデモ
                      </Link>
                    </li>
                    <li>
                      <Link href="/users" className="text-blue-500 hover:underline">
                        ユーザー一覧
                      </Link>
                    </li>
                  </ul>
                  <UserMenu />
                </nav>
                {children}
              </div>
            </div>
          </ThemeProvider>
        </LineAuthProvider>
      </body>
    </html>
  );
}
