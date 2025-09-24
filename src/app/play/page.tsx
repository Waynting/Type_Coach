"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  getProfile, 
  saveProfile, 
  saveSession 
} from "@/lib/db"
import { 
  updateKeyStats, 
  updateBigramStats, 
  updateConfusionMatrix,
  calculateWPM,
  calculateAccuracy
} from "@/engine/keystats"
import { generateAdaptiveDrill, generateRandomText, charToKeyCode } from "@/engine/scheduler"
import { getArticleById } from "@/lib/articles"
import type { Keystroke, Profile } from "@/engine/types"

function PlayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "timed"
  const duration = parseInt(searchParams.get("duration") || "60")
  const articleId = searchParams.get("articleId")
  const includeNumbers = searchParams.get("includeNumbers") === "true"
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready")
  const [timeLeft, setTimeLeft] = useState(duration)
  const [targetText, setTargetText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showError, setShowError] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    totalChars: 0,
    backspaces: 0
  })
  const [lineBreakPoints, setLineBreakPoints] = useState<number[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  
  const lastKeystrokeTime = useRef<number>(0)
  const sessionStartTime = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const gameReadyRef = useRef(false)

  useEffect(() => {
    const prof = getProfile()
    setProfile(prof)
    
    // Generate target text based on mode
    if (mode === "drill") {
      const drillText = generateAdaptiveDrill(prof, "mixed", duration, includeNumbers)
      setTargetText(drillText)
    } else if (mode === "article" && articleId) {
      // Article mode - load selected article
      const article = getArticleById(articleId)
      if (article) {
        setTargetText(article.content)
      } else {
        // Fallback if article not found
        router.push("/")
      }
    } else if (mode === "paragraph") {
      // Generate varied paragraph text
      const randomText = generateRandomText(400, includeNumbers)
      setTargetText(randomText)
    } else {
      // Timed mode - generate varied words based on duration
      const charsPerMinute = 675
      const targetChars = Math.floor(charsPerMinute * (duration / 60))
      const randomText = generateRandomText(targetChars, includeNumbers)
      setTargetText(randomText)
    }
  }, [mode, duration, articleId, includeNumbers, router])

  // Calculate line break points when target text changes
  useEffect(() => {
    if (!targetText) return
    
    const charsPerLine = 60  // Reduced from 65 to break earlier
    const breakPoints: number[] = []
    let currentPos = 0
    
    while (currentPos < targetText.length) {
      // Set initial line end earlier to leave more buffer
      let lineEnd = currentPos + charsPerLine - 5  // Subtract 5 for earlier break
      
      // If we're not at the end of the text, find the last space before line end
      if (lineEnd < targetText.length) {
        let lastSpace = lineEnd
        // Look back up to 20 chars for a space (increased from 15)
        while (lastSpace > currentPos + charsPerLine - 25 && targetText[lastSpace] !== ' ') {
          lastSpace--
        }
        // If we found a space, use it
        if (targetText[lastSpace] === ' ' && lastSpace > currentPos) {
          lineEnd = lastSpace - 1  // Break right before the space
        }
      } else {
        lineEnd = targetText.length - 1
      }
      
      breakPoints.push(lineEnd)
      currentPos = lineEnd + 2  // Skip the space when starting next line
    }
    
    setLineBreakPoints(breakPoints)
  }, [targetText])

  // Auto-focus input and prepare for immediate typing
  useEffect(() => {
    if (targetText && gameState === "ready") {
      // Focus the input as soon as target text is ready
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus()
        gameReadyRef.current = true
      }, 100)
      
      return () => clearTimeout(focusTimer)
    }
  }, [targetText, gameState])

  // Timer effect - works for both timed and drill modes
  useEffect(() => {
    if (gameState === "playing" && (mode === "timed" || mode === "drill") && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing" && (mode === "timed" || mode === "drill")) {
      endGame()
    }
  }, [gameState, timeLeft, mode])


  const endGame = async () => {
    setGameState("finished")
    
    if (!profile) return
    
    // Calculate final stats
    const sessionDuration = (performance.now() - sessionStartTime.current) / 1000
    const finalWPM = calculateWPM(sessionStats.correctChars, sessionDuration)
    const finalAccuracy = calculateAccuracy(sessionStats.correctChars, sessionStats.totalChars)
    
    // Save session
    const session = {
      id: `session-${Date.now()}`,
      startedAt: Date.now(),
      durationSec: sessionDuration,
      mode: (mode === "article" ? "paragraph" : mode) as "timed" | "paragraph" | "drill",
      wpm: finalWPM,
      accuracy: finalAccuracy,
      totalKeystrokes: keystrokes.length,
      keystrokes: keystrokes.slice(0, 1000) // Limit storage
    }
    
    await saveSession(session)
    saveProfile(profile)
    
    // Navigate to results
    router.push(`/review?sessionId=${session.id}`)
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-start game on first meaningful keypress with immediate state transition
    if (gameState === "ready" && e.key.length === 1 && gameReadyRef.current) {
      // Immediately transition to playing state for real-time processing
      setGameState("playing")
      setCurrentIndex(0)
      setUserInput("")
      setCurrentLineIndex(0)
      sessionStartTime.current = performance.now()
      lastKeystrokeTime.current = performance.now()
    }
    
    if (e.key === "Tab" || e.key === "Escape") {
      e.preventDefault()
      return
    }
    
    // Process input if game is playing or starting with this keypress
    const isStartingKeypress = gameState === "ready" && e.key.length === 1 && gameReadyRef.current
    if (gameState !== "playing" && !isStartingKeypress) {
      return
    }
    
    const now = performance.now()
    const latency = now - lastKeystrokeTime.current
    lastKeystrokeTime.current = now
    
    const keystroke: Keystroke = {
      ts: now,
      expected: null, // Will be set later if needed
      received: e.code,
      correct: false,
      latencyMs: latency,
      backspace: e.key === "Backspace"
    }
    
    if (e.key === "Backspace") {
      e.preventDefault()
      setSessionStats(prev => ({ ...prev, backspaces: prev.backspaces + 1 }))
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
        setUserInput(prev => prev.slice(0, -1))
      }
    } else if (e.key.length === 1) {
      e.preventDefault()
      const expectedChar = targetText[currentIndex]
      const isCorrect = e.key === expectedChar
      keystroke.correct = isCorrect
      keystroke.expected = charToKeyCode(expectedChar)
      
      setSessionStats(prev => ({
        ...prev,
        totalChars: prev.totalChars + 1,
        correctChars: isCorrect ? prev.correctChars + 1 : prev.correctChars
      }))
      
      // Update profile stats
      if (profile) {
        updateKeyStats(profile.keyStats, keystroke)
        
        if (keystrokes.length > 0) {
          const prevKey = keystrokes[keystrokes.length - 1].received
          updateBigramStats(
            profile.bigramStats,
            prevKey,
            keystroke.received,
            latency,
            isCorrect
          )
        }
        
        if (!isCorrect && keystroke.expected) {
          updateConfusionMatrix(
            profile.confusion,
            keystroke.expected,
            keystroke.received
          )
          
          // Show error flash
          setShowError(true)
          setTimeout(() => setShowError(false), 200)
        }
      }
      
      setKeystrokes(prev => [...prev, keystroke])
      setUserInput(prev => prev + e.key)
      setCurrentIndex(prev => prev + 1)
      
      // Check if we've reached a line break point
      if (lineBreakPoints.includes(currentIndex)) {
        setCurrentLineIndex(prev => prev + 1)
      }
      
      // Check if finished paragraph or article mode
      if ((mode === "paragraph" || mode === "article") && currentIndex + 1 >= targetText.length) {
        endGame()
      }
    }
    
    // Update live stats
    const elapsed = (now - sessionStartTime.current) / 1000 / 60 // minutes
    if (elapsed > 0) {
      setSessionStats(prev => ({
        ...prev,
        wpm: Math.round(prev.correctChars / 5 / elapsed),
        accuracy: Math.round((prev.correctChars / prev.totalChars) * 100) || 0
      }))
    }
  }, [gameState, currentIndex, targetText, keystrokes, profile, mode])

  const handleInputFocus = () => {
    // Just ensure the input is ready for typing, don't auto-start
    if (gameState === "ready" && targetText) {
      gameReadyRef.current = true
    }
  }

  const progress = (mode === "timed" || mode === "drill")
    ? ((duration - timeLeft) / duration) * 100
    : (currentIndex / targetText.length) * 100

  // Calculate text window with MonkeyType-style line wrapping
  const getTextWindow = () => {
    if (!targetText || lineBreakPoints.length === 0) return { 
      windowText: "", 
      relativeCurrentIndex: 0,
      windowStart: 0 
    }
    
    const totalLines = 3
    
    // Determine window start based on current line index
    let windowStartLine = 0
    
    if (currentLineIndex === 0) {
      // First line - show lines 0-2
      windowStartLine = 0
    } else if (currentLineIndex === 1) {
      // Second line - still show lines 0-2
      windowStartLine = 0
    } else {
      // Third line or beyond - show current line as middle line
      windowStartLine = currentLineIndex - 1
    }
    
    // Calculate actual character positions from line break points
    let windowStart = 0
    if (windowStartLine > 0) {
      windowStart = lineBreakPoints[windowStartLine - 1] + 1
    }
    
    // Adjust to word boundaries at start - don't break words
    if (windowStart > 0) {
      let originalStart = windowStart
      // Look backward for a space, but don't go too far back
      while (windowStart > 0 && targetText[windowStart] !== ' ' && (originalStart - windowStart) < 20) {
        windowStart--
      }
      // If we found a space, start after it
      if (windowStart > 0 && targetText[windowStart] === ' ') {
        windowStart++
      }
      // If we went too far back, use original calculated position
      if ((originalStart - windowStart) >= 20) {
        windowStart = originalStart
      }
    }
    
    // Calculate window end based on line break points
    const windowEndLine = Math.min(windowStartLine + totalLines - 1, lineBreakPoints.length - 1)
    let windowEnd = lineBreakPoints[windowEndLine] + 1
    
    // Make sure we don't go past the text length
    windowEnd = Math.min(windowEnd, targetText.length)
    
    const windowText = targetText.slice(windowStart, windowEnd)
    const relativeCurrentIndex = currentIndex - windowStart
    
    return {
      windowText,
      relativeCurrentIndex: Math.max(0, relativeCurrentIndex),
      windowStart
    }
  }

  const textWindow = getTextWindow()

  const getTitle = () => {
    const numberSuffix = includeNumbers ? " (with Numbers)" : ""
    
    if (mode === "drill") {
      return "Adaptive Drill" + numberSuffix
    }
    if (mode === "timed") {
      return `${duration}s Test` + numberSuffix
    }
    if (mode === "article" && articleId) {
      const article = getArticleById(articleId)
      return article ? `Article: ${article.title}` + numberSuffix : "Article Mode" + numberSuffix
    }
    return "Paragraph Mode" + numberSuffix
  }

  return (
    <div className="container mx-auto py-2 sm:py-4 lg:py-6 max-w-4xl px-4 sm:px-6">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground min-h-[44px] px-3 py-2 touch-manipulation"
                aria-label="Back to dashboard"
              >
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {getTitle()}
            </h1>
          </div>
          {gameState === "playing" && (mode === "timed" || mode === "drill") && (
            <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-primary self-center sm:self-auto">
              {timeLeft}s
            </div>
          )}
        </div>
        
        {/* Progress */}
        <Progress value={progress} className="h-2 sm:h-3" />
      </div>

      {/* Main typing area */}
      <Card className={`transition-all duration-200 ${showError ? 'border-red-500 shadow-red-200' : ''}`}>
        <CardContent className="p-4">
          {/* Continuous Text Flow - 3 Line Window */}
          <div 
            className="relative bg-muted/50 p-3 sm:p-4 md:p-6 rounded-lg font-mono text-base sm:text-lg md:text-xl lg:text-2xl leading-normal mb-4 text-left max-w-4xl mx-auto overflow-hidden transition-all duration-150 ease-out h-[90px] sm:h-[105px] md:h-[120px] lg:h-[135px]"
            role="region"
            aria-label="Text to type"
            aria-live="polite"
            aria-atomic="false"
            style={{ 
              lineHeight: '1.5em'
            }}
          >
            <div className="whitespace-pre-wrap break-words">
              {/* Render completed text with correct/incorrect styling */}
              {textWindow.windowText.slice(0, textWindow.relativeCurrentIndex).split('').map((char, index) => {
                const absoluteIndex = textWindow.windowStart + index
                const isCorrect = absoluteIndex < userInput.length ? userInput[absoluteIndex] === char : true
                
                return (
                  <span 
                    key={index}
                    className={isCorrect ? "text-green-600 opacity-70" : "text-red-500 bg-red-100"}
                  >
                    {char}
                  </span>
                )
              })}
              <span 
                className={`${showError ? 'bg-red-500' : 'bg-primary'} text-primary-foreground px-1 py-0.5 rounded transition-colors duration-200 font-bold`}
                aria-label="Current character to type"
                role="mark"
              >
                {textWindow.windowText[textWindow.relativeCurrentIndex] || '✓'}
              </span>
              <span className="text-muted-foreground opacity-80" aria-label="Upcoming text">
                {textWindow.windowText.slice(textWindow.relativeCurrentIndex + 1)}
              </span>
            </div>
          </div>
          
          {/* Hidden Input Area - Maintains focus for keyboard capture */}
          <div className="sr-only">
            <label htmlFor="typing-input">
              Type the text displayed above. {gameState === "ready" ? "Start typing to begin." : "Continue typing the highlighted character."}
            </label>
            <input
              id="typing-input"
              ref={inputRef}
              type="text"
              className="w-full"
              value=""
              onChange={(e) => {
                // Prevent normal onChange behavior since we handle input via onKeyDown
                e.preventDefault()
              }}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              disabled={gameState === "finished"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              readOnly={false}
              aria-label="Type the highlighted text shown above"
              aria-describedby="typing-instructions progress-info"
              aria-invalid={showError}
            />
          </div>

          {/* Compact Live Stats - Progressive Disclosure */}
          {(gameState === "playing" || gameState === "finished") && (
            <div id="progress-info" className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-center" role="region" aria-label="Typing statistics">
              {/* Essential stats during typing */}
              <div className="bg-muted/50 rounded px-3 sm:px-4 py-2 sm:py-3 min-w-[80px] sm:min-w-[90px]">
                <p className="text-xs sm:text-sm text-muted-foreground">WPM</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" aria-label={`${sessionStats.wpm} words per minute`}>{sessionStats.wpm}</p>
              </div>
              <div className="bg-muted/50 rounded px-3 sm:px-4 py-2 sm:py-3 min-w-[80px] sm:min-w-[90px]">
                <p className="text-xs sm:text-sm text-muted-foreground">Accuracy</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold" aria-label={`${sessionStats.accuracy} percent accuracy`}>{sessionStats.accuracy}%</p>
              </div>
              {/* Show additional stats only when finished */}
              {gameState === "finished" && (
                <>
                  <div className="bg-muted/50 rounded px-3 sm:px-4 py-2 sm:py-3 min-w-[80px] sm:min-w-[90px]">
                    <p className="text-xs sm:text-sm text-muted-foreground">Characters</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold" aria-label={`${sessionStats.correctChars} correct characters`}>{sessionStats.correctChars}</p>
                  </div>
                  <div className="bg-muted/50 rounded px-3 sm:px-4 py-2 sm:py-3 min-w-[80px] sm:min-w-[90px]">
                    <p className="text-xs sm:text-sm text-muted-foreground">Errors</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold" aria-label={`${sessionStats.totalChars - sessionStats.correctChars} errors`}>{sessionStats.totalChars - sessionStats.correctChars}</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Screen Reader Announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {gameState === "playing" && showError && "Incorrect character"}
            {gameState === "finished" && `Typing session completed. Final speed: ${sessionStats.wpm} words per minute. Accuracy: ${sessionStats.accuracy} percent.`}
          </div>
          
          {/* Compact Actions */}
          {gameState !== "ready" && (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
              {gameState === "playing" && (
                <Button size="sm" variant="outline" onClick={endGame} className="min-h-[44px] px-4 py-2 touch-manipulation">
                  Finish Early
                </Button>
              )}
              {gameState === "finished" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="min-h-[44px] px-4 py-2 touch-manipulation">
                    Try Again
                  </Button>
                  <Button size="sm" onClick={() => router.push("/")} className="min-h-[44px] px-4 py-2 touch-manipulation">
                    Dashboard
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Instructions - Only when ready */}
      {gameState === "ready" && (
        <div id="typing-instructions" className="mt-4 px-4 text-center text-muted-foreground text-sm sm:text-base" role="region" aria-label="Instructions">
          <p>Start typing to begin immediately • Type the highlighted character • Mistakes will flash red</p>
        </div>
      )}
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  )
}