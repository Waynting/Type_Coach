"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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

interface CustomTimerDialogProps {
  children: React.ReactNode
}

export function CustomTimerDialog({ children }: CustomTimerDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [customTime, setCustomTime] = useState("120")
  const [selectedMode, setSelectedMode] = useState<"timed" | "drill">("timed")
  const [includeNumbers, setIncludeNumbers] = useState(false)
  const [inputError, setInputError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  const presetTimes = [
    { label: "30 seconds", value: "30", icon: "⚡" },
    { label: "1 minute", value: "60", icon: "⏱️" },
    { label: "2 minutes", value: "120", icon: "🎯" },
    { label: "5 minutes", value: "300", icon: "💪" },
    { label: "10 minutes", value: "600", icon: "🚀" }
  ]

  const handleStart = async (duration: string) => {
    setIsLoading(true)
    setInputError("")
    
    try {
      const mode = selectedMode
      const params = new URLSearchParams({
        mode,
        duration,
        ...(includeNumbers && { includeNumbers: "true" })
      })
      router.push(`/play?${params.toString()}`)
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const validateInput = (value: string): string => {
    const duration = parseInt(value)
    if (isNaN(duration)) return "Please enter a valid number"
    if (duration < 10) return "Minimum duration is 10 seconds"
    if (duration > 1800) return "Maximum duration is 30 minutes (1800 seconds)"
    return ""
  }

  const handleCustomStart = () => {
    const error = validateInput(customTime)
    if (error) {
      setInputError(error)
      return
    }
    handleStart(customTime)
  }

  const handleTimeChange = (value: string) => {
    setCustomTime(value)
    if (inputError) {
      const error = validateInput(value)
      setInputError(error)
    }
  }

  // Focus management
  useEffect(() => {
    if (open && firstButtonRef.current) {
      setTimeout(() => {
        firstButtonRef.current?.focus()
      }, 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Timer Settings</DialogTitle>
          <DialogDescription>
            Choose your preferred time duration and mode
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mode Selection */}
          <fieldset>
            <legend className="text-sm font-medium mb-3">Practice Mode</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select practice mode">
              <Button
                ref={firstButtonRef}
                variant={selectedMode === "timed" ? "default" : "outline"}
                onClick={() => setSelectedMode("timed")}
                className="w-full"
                role="radio"
                aria-checked={selectedMode === "timed"}
                aria-describedby="timed-desc"
                disabled={isLoading}
              >
                Timed Test
              </Button>
              <Button
                variant={selectedMode === "drill" ? "default" : "outline"}
                onClick={() => setSelectedMode("drill")}
                className="w-full"
                role="radio"
                aria-checked={selectedMode === "drill"}
                aria-describedby="drill-desc"
                disabled={isLoading}
              >
                Adaptive Drill
              </Button>
            </div>
            <div className="sr-only">
              <div id="timed-desc">Fixed duration typing test</div>
              <div id="drill-desc">Adaptive practice targeting your weak areas</div>
            </div>
          </fieldset>

          {/* Number Toggle (for all modes) */}
          <div>
            <h4 className="text-sm font-medium mb-3">Practice Options</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-numbers"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="include-numbers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Include numbers (0-9) in practice
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Practice typing numbers along with letters for more variety
            </p>
          </div>

          {/* Preset Times */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {presetTimes.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  onClick={() => handleStart(preset.value)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                  disabled={isLoading}
                  aria-label={`Start ${preset.label} session`}
                >
                  <span className="text-lg" aria-hidden="true">{preset.icon}</span>
                  <span className="text-xs">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Time Input */}
          <div>
            <label htmlFor="custom-duration" className="text-sm font-medium mb-3 block">
              Custom Duration
            </label>
            <div className="flex gap-2">
              <input
                id="custom-duration"
                type="number"
                min="10"
                max="1800"
                value={customTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                  inputError ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Enter seconds (10-1800)"
                aria-describedby="duration-help duration-error"
                aria-invalid={!!inputError}
                disabled={isLoading}
              />
              <Button 
                onClick={handleCustomStart} 
                disabled={isLoading || !!inputError}
                aria-describedby={inputError ? "duration-error" : undefined}
              >
                {isLoading ? "Starting..." : "Start"}
              </Button>
            </div>
            <div className="mt-1">
              <p id="duration-help" className="text-xs text-muted-foreground">
                Enter duration in seconds (10s - 30min)
              </p>
              {inputError && (
                <p id="duration-error" className="text-xs text-red-600 mt-1" role="alert">
                  {inputError}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}