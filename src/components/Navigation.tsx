"use client"

import { ThemeToggle } from "./ThemeToggle"

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-end">
        <ThemeToggle />
      </div>
    </nav>
  )
}
