import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HelpButton } from "@/components/HelpButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Typing Coach",
  description: "Local-first typing game with weakness diagnosis and adaptive training",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <HelpButton />
      </body>
    </html>
  )
}