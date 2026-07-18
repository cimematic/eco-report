import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/store"
import Navigation from "@/components/Navigation"
import LoginModal from "@/components/LoginModal"
import UserBadge from "@/components/UserBadge"
import Onboarding from "@/components/Onboarding"
import { ToastProvider } from "@/components/Toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "에코리포트 - Eco Report",
  description: "내 동네 환경 문제를 지도에 표시하고 AI 브리핑으로 확인하세요",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "에코리포트" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#059669" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full bg-gray-50">
        <ToastProvider>
          <AppProvider>
            <Onboarding />
            <LoginModal />
            <main className="max-w-lg mx-auto pb-20 min-h-screen">
              <UserBadge />
              {children}
            </main>
            <Navigation />
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
