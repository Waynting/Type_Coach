"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db, getProfile } from "@/lib/db"
import { getTopWeakKeys, getTopWeakBigrams, getTopConfusions } from "@/engine/weakness"
import type { Session, Profile } from "@/engine/types"

function ReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId")
  
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  
  useEffect(() => {
    async function loadData() {
      if (!sessionId) {
        router.push("/")
        return
      }
      
      const sess = await db.sessions.get(sessionId)
      if (!sess) {
        router.push("/")
        return
      }
      
      setSession(sess)
      
      const prof = getProfile()
      setProfile(prof)
      
      // Generate recommendations based on weaknesses
      const weakKeys = getTopWeakKeys(prof.keyStats, 3)
      const weakBigrams = getTopWeakBigrams(prof.bigramStats, 3)
      const confusions = getTopConfusions(prof.confusion, 2)
      
      const recs: string[] = []
      
      if (weakKeys.length > 0) {
        recs.push(`Focus on keys: ${weakKeys.map(k => k.code.replace('Key', '')).join(', ')}`)
      }
      
      if (weakBigrams.length > 0) {
        recs.push(`Practice bigrams: ${weakBigrams.map(b => {
          const [a, b2] = b.bigram.split('>')
          return `${a.replace('Key', '')}${b2.replace('Key', '')}`
        }).join(', ')}`)
      }
      
      if (confusions.length > 0) {
        recs.push(`Watch out for: ${confusions.map(c => 
          `${c.expected.replace('Key', '')}→${c.received.replace('Key', '')}`
        ).join(', ')}`)
      }
      
      if (sess.accuracy < 95) {
        recs.push("Slow down and focus on accuracy")
      }
      
      if (sess.wpm < 40) {
        recs.push("Practice daily to build muscle memory")
      }
      
      setRecommendations(recs)
    }
    
    loadData()
  }, [sessionId, router])
  
  if (!session || !profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Loading...</div>
      </div>
    )
  }
  
  const weakKeys = getTopWeakKeys(profile.keyStats, 5)
  const weakBigrams = getTopWeakBigrams(profile.bigramStats, 5)
  const confusions = getTopConfusions(profile.confusion, 5)
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Session Results</h1>
        <p className="text-muted-foreground">
          {new Date(session.startedAt).toLocaleString()}
        </p>
      </div>
      
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>WPM</CardTitle>
            <CardDescription>Words Per Minute</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{session.wpm}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accuracy</CardTitle>
            <CardDescription>Correct keystrokes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{session.accuracy}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
            <CardDescription>Time spent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{Math.round(session.durationSec)}s</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Based on your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Weakness Analysis */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Slowest Keys</CardTitle>
            <CardDescription>Keys with highest response time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weakKeys.map(key => (
                <div key={key.code} className="flex justify-between items-center">
                  <span className="font-mono text-lg">{key.code.replace('Key', '')}</span>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(key.ewmaRt)}ms • {key.errors} errors
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Slowest Bigrams</CardTitle>
            <CardDescription>Two-key combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weakBigrams.map(bigram => {
                const [a, b] = bigram.bigram.split('>')
                return (
                  <div key={bigram.bigram} className="flex justify-between items-center">
                    <span className="font-mono text-lg">
                      {a.replace('Key', '')}{b.replace('Key', '')}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(bigram.ewmaRt)}ms • {bigram.errors} errors
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Common Mistakes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Common Mistakes</CardTitle>
          <CardDescription>Keys you often confuse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {confusions.map(({ expected, received, count }) => (
              <div key={`${expected}|${received}`} className="flex justify-between items-center">
                <span className="font-mono">
                  Typed {received.replace('Key', '')} instead of {expected.replace('Key', '')}
                </span>
                <span className="text-sm text-muted-foreground">×{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link href="/play?mode=drill&duration=60">
          <Button size="lg">Start Adaptive Drill</Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  )
}