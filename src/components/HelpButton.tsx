"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, X } from "lucide-react"

interface HelpContent {
  title: string
  sections: {
    heading: string
    items: string[]
  }[]
}

function HelpButtonContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Get current mode for play page
  const mode = searchParams.get("mode") || "timed"
  const includeNumbers = searchParams.get("includeNumbers") === "true"

  const getHelpContent = (): HelpContent => {
    if (pathname === "/play") {
      const modeDescription = {
        timed: "Fixed duration typing test",
        drill: "Adaptive practice targeting weak areas",
        paragraph: "Complete paragraph typing",
        article: "Real article content practice"
      }[mode] || "Typing practice"

      return {
        title: `Help - ${modeDescription}${includeNumbers ? " (with Numbers)" : ""}`,
        sections: [
          {
            heading: "How to Type",
            items: [
              "Click in the input field or start typing to begin",
              "Type the highlighted character shown above",
              "Correct characters turn green, errors flash red",
              "Use backspace to correct mistakes",
              "Game auto-starts when you begin typing"
            ]
          },
          {
            heading: "Practice Modes",
            items: [
              "Timed: Complete as much as possible in set time",
              "Adaptive Drill: AI-generated content targeting your weaknesses",
              "Paragraph: Type a complete paragraph",
              "Article: Practice with real article content"
            ]
          },
          {
            heading: "Live Statistics",
            items: [
              "WPM: Words per minute (words = chars ÷ 5)",
              "Accuracy: Percentage of correct keystrokes",
              "Characters: Total correct characters typed",
              "Errors: Number of incorrect keystrokes"
            ]
          },
          {
            heading: "Tips for Better Typing",
            items: [
              "Keep wrists straight and relaxed",
              "Use all 10 fingers (touch typing)",
              "Focus on accuracy first, speed comes naturally",
              "Take breaks every 15-20 minutes",
              "Practice daily for consistent improvement"
            ]
          }
        ]
      }
    } else if (pathname === "/review") {
      return {
        title: "Help - Session Results",
        sections: [
          {
            heading: "Understanding Your Results",
            items: [
              "WPM: Higher is better (beginner: 20-30, average: 40-60, expert: 70+)",
              "Accuracy: Aim for 95%+ accuracy for effective practice",
              "Duration: Time spent in the typing session"
            ]
          },
          {
            heading: "Weakness Analysis",
            items: [
              "Slowest Keys: Keys with highest response time",
              "Slowest Bigrams: Two-character combinations that slow you down",
              "Common Mistakes: Character confusions you make frequently",
              "Focus practice on these areas for maximum improvement"
            ]
          },
          {
            heading: "Improvement Recommendations",
            items: [
              "Follow the personalized suggestions based on your performance",
              "Use Adaptive Drill to target specific weaknesses",
              "Practice consistently for 15-30 minutes daily",
              "Track progress over multiple sessions"
            ]
          },
          {
            heading: "Performance Benchmarks",
            items: [
              "Beginner: 20-30 WPM, 85%+ accuracy",
              "Intermediate: 40-60 WPM, 95%+ accuracy", 
              "Advanced: 70+ WPM, 97%+ accuracy",
              "Expert: 90+ WPM, 98%+ accuracy"
            ]
          }
        ]
      }
    } else {
      // Dashboard help
      return {
        title: "Help - Typing Coach Dashboard",
        sections: [
          {
            heading: "Quick Actions",
            items: [
              "Quick Drill: 5-minute adaptive practice session",
              "Speed Test: 60-second typing challenge",
              "Custom Timer: Set your own duration and options",
              "Article Practice: Type with real article content",
              "Paragraph: Classic paragraph typing mode"
            ]
          },
          {
            heading: "Today's Stats",
            items: [
              "Practice Time: Total minutes practiced today",
              "Average WPM: Your average words per minute today",
              "Accuracy: Your average accuracy percentage today",
              "Stats reset daily to track daily progress"
            ]
          },
          {
            heading: "Weakness Analysis",
            items: [
              "Weakest Keys: Shows keys that need the most practice",
              "Common Confusions: Character pairs you frequently mix up",
              "Data updates after each typing session",
              "Use this info to focus your practice sessions"
            ]
          },
          {
            heading: "Getting Started",
            items: [
              "Start with a Quick Drill to establish baseline performance",
              "Practice daily for 15-30 minutes for best results",
              "Focus on accuracy first, speed will follow naturally",
              "Use different modes to keep practice engaging"
            ]
          }
        ]
      }
    }
  }

  const helpContent = getHelpContent()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 sm:w-80">
            <Card className="shadow-lg border">
              <CardContent className="p-3">
                <p className="text-sm font-medium mb-1">Need help?</p>
                <p className="text-xs text-muted-foreground">
                  Click for instructions and tips for this page
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              ref={buttonRef}
              size="default"
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              aria-label="Open help and instructions"
              aria-describedby="help-tooltip"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg sm:text-xl font-bold break-words">
                {helpContent.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                Instructions and tips for using the typing coach
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              {helpContent.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-primary break-words">
                    {section.heading}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-primary mt-1.5 text-xs flex-shrink-0">•</span>
                        <span className="text-xs sm:text-sm leading-relaxed break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer with additional tips */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HelpCircle className="h-3 w-3 flex-shrink-0" />
                <span className="break-words">Press Escape or click outside to close this help dialog</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hidden tooltip for screen readers */}
      <div id="help-tooltip" className="sr-only">
        Floating help button. Click to open detailed instructions for this page.
      </div>
    </div>
  )
}

export function HelpButton() {
  return (
    <Suspense fallback={
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="default"
          className="h-12 w-12 rounded-full shadow-lg"
          aria-label="Loading help"
          disabled
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    }>
      <HelpButtonContent />
    </Suspense>
  )
}