"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentSessions, deleteSession, deleteAllSessions } from "@/lib/db"
import type { Session } from "@/engine/types"

export default function SessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const allSessions = await getRecentSessions(100)
      setSessions(allSessions)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return
    }

    setDeletingId(sessionId)
    try {
      await deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error("Failed to delete session:", error)
      alert("Failed to delete session. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAllSessions = async () => {
    if (!confirm("Are you sure you want to delete ALL sessions? This will also reset all your typing statistics. This action cannot be undone.")) {
      return
    }

    setIsDeletingAll(true)
    try {
      await deleteAllSessions()
      setSessions([])
    } catch (error) {
      console.error("Failed to delete all sessions:", error)
      alert("Failed to delete all sessions. Please try again.")
    } finally {
      setIsDeletingAll(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="text-center">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Session History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and manage your typing sessions
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            {sessions.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteAllSessions}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? "Deleting..." : "Delete All"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-muted-foreground mb-4">No sessions yet</p>
            <Link href="/play?mode=timed&duration=60">
              <Button>Start Your First Session</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">
                        {session.mode === "timed" ? "Timed Test" :
                         session.mode === "drill" ? "Adaptive Drill" :
                         "Paragraph"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(session.startedAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">WPM:</span>{" "}
                        <span className="font-bold">{session.wpm}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>{" "}
                        <span className="font-bold">{session.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        <span className="font-bold">{formatDuration(session.durationSec)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Keystrokes:</span>{" "}
                        <span className="font-bold">{session.totalKeystrokes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col lg:flex-row">
                    <Link href={`/review?sessionId=${session.id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}
                      className="w-full sm:w-auto"
                    >
                      {deletingId === session.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
