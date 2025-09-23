"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfile, getRecentSessions } from "@/lib/db"
import { getTopWeakKeys, getTopConfusions } from "@/engine/weakness"
import { CustomTimerDialog } from "@/components/CustomTimerDialog"
import { ArticleSelectionDialog } from "@/components/ArticleSelectionDialog"
import type { Profile, Session } from "@/engine/types"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentSession, setRecentSession] = useState<Session | null>(null)
  const [todayStats, setTodayStats] = useState({
    totalTime: 0,
    avgWPM: 0,
    avgAccuracy: 0
  })

  useEffect(() => {
    async function loadData() {
      const prof = getProfile()
      setProfile(prof)
      
      const sessions = await getRecentSessions(10)
      if (sessions.length > 0) {
        setRecentSession(sessions[0])
        
        // Calculate today's stats
        const today = new Date().setHours(0, 0, 0, 0)
        const todaySessions = sessions.filter(s => s.startedAt >= today)
        
        if (todaySessions.length > 0) {
          const totalTime = todaySessions.reduce((sum, s) => sum + s.durationSec, 0)
          const avgWPM = todaySessions.reduce((sum, s) => sum + s.wpm, 0) / todaySessions.length
          const avgAccuracy = todaySessions.reduce((sum, s) => sum + s.accuracy, 0) / todaySessions.length
          
          setTodayStats({
            totalTime: Math.round(totalTime / 60), // Convert to minutes
            avgWPM: Math.round(avgWPM),
            avgAccuracy: Math.round(avgAccuracy)
          })
        }
      }
    }
    
    loadData()
  }, [])

  const weakKeys = profile ? getTopWeakKeys(profile.keyStats, 5) : []
  const confusions = profile ? getTopConfusions(profile.confusion, 3) : []

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">Typing Coach</h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Local-first typing game with weakness diagnosis and adaptive training
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group focus-within:ring-2 focus-within:ring-primary">
          <Link href="/play?mode=timed&duration=60" className="block">
            <CardContent className="p-4 sm:p-6 text-center min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
              <div className="text-xl sm:text-2xl mb-2" aria-hidden="true">⚡</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">Standard Test</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">60 seconds timed challenge</p>
            </CardContent>
          </Link>
        </Card>

        <CustomTimerDialog>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group focus-within:ring-2 focus-within:ring-primary" tabIndex={0}>
            <CardContent className="p-4 sm:p-6 text-center min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
              <div className="text-xl sm:text-2xl mb-2" aria-hidden="true">⏱️</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">Custom Timer</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Set your own duration</p>
            </CardContent>
          </Card>
        </CustomTimerDialog>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group focus-within:ring-2 focus-within:ring-primary">
          <Link href="/play?mode=paragraph" className="block">
            <CardContent className="p-4 sm:p-6 text-center min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
              <div className="text-xl sm:text-2xl mb-2" aria-hidden="true">📝</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">Paragraph</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Classic paragraph mode</p>
            </CardContent>
          </Link>
        </Card>

        <ArticleSelectionDialog>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group focus-within:ring-2 focus-within:ring-primary" tabIndex={0}>
            <CardContent className="p-4 sm:p-6 text-center min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
              <div className="text-xl sm:text-2xl mb-2" aria-hidden="true">📚</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1">Article Practice</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Type with real articles</p>
            </CardContent>
          </Card>
        </ArticleSelectionDialog>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Today's Practice</p>
                <p className="text-2xl sm:text-3xl font-bold">{todayStats.totalTime}m</p>
              </div>
              <div className="text-2xl sm:text-3xl">⏰</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Average WPM</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {todayStats.avgWPM || "—"}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl">⚡</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {todayStats.avgAccuracy ? `${todayStats.avgAccuracy}%` : "—"}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl">🎯</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weakness Analysis */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Weakest Keys</CardTitle>
            <CardDescription className="text-sm sm:text-base">Keys that need the most practice</CardDescription>
          </CardHeader>
          <CardContent>
            {weakKeys.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💪</div>
                <p className="text-muted-foreground">Complete a session to see your weak keys</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakKeys.map((key, i) => (
                  <div key={key.code} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-primary text-primary-foreground rounded px-2 py-1">#{i + 1}</span>
                      <span className="font-mono text-xl font-bold">{key.code.replace('Key', '')}</span>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{key.errors} errors</div>
                      <div>{Math.round(key.ewmaRt)}ms RT</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Common Confusions</CardTitle>
            <CardDescription className="text-sm sm:text-base">Keys you often mix up</CardDescription>
          </CardHeader>
          <CardContent>
            {confusions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-muted-foreground">No confusions detected yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {confusions.map(({ expected, received, count }) => (
                  <div key={`${expected}|${received}`} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg">
                        <span className="text-green-600">{expected.replace('Key', '')}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="text-red-600">{received.replace('Key', '')}</span>
                      </span>
                    </div>
                    <span className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}