"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { articles, getAllCategories, getArticlesByCategory, type Article } from "@/lib/articles"

interface ArticleSelectionDialogProps {
  children: React.ReactNode
}

export function ArticleSelectionDialog({ children }: ArticleSelectionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const firstCategoryRef = useRef<HTMLButtonElement>(null)

  const categories = ["All", ...getAllCategories()]
  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : getArticlesByCategory(selectedCategory)

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article)
  }

  const handleStart = async () => {
    if (selectedArticle) {
      setIsLoading(true)
      try {
        // Pass article ID as parameter to play page
        router.push(`/play?mode=article&articleId=${selectedArticle.id}`)
        setOpen(false)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Focus management
  useEffect(() => {
    if (open && firstCategoryRef.current) {
      setTimeout(() => {
        firstCategoryRef.current?.focus()
      }, 100)
    }
  }, [open])

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Technology": "💻",
      "Environment": "🌍",
      "Science": "🔬",
      "Education": "📚",
      "Health": "🏥",
      "All": "📄"
    }
    return icons[category] || "📄"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose an Article</DialogTitle>
          <DialogDescription>
            Select an article to practice typing with
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Filter */}
          <fieldset>
            <legend className="text-sm font-medium mb-3">Category</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select article category">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  ref={index === 0 ? firstCategoryRef : undefined}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2"
                  role="radio"
                  aria-checked={selectedCategory === category}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">{getCategoryIcon(category)}</span>
                  {category}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Article List */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Articles ({filteredArticles.length})
            </h4>
            <div className="grid gap-3 max-h-60 overflow-y-auto" role="listbox" aria-label="Available articles">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className={`cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary ${
                    selectedArticle?.id === article.id 
                      ? "ring-2 ring-primary border-primary" 
                      : ""
                  }`}
                  role="option"
                  aria-selected={selectedArticle?.id === article.id}
                  tabIndex={0}
                  onClick={() => handleArticleSelect(article)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleArticleSelect(article)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm leading-tight">
                        {article.title}
                      </h5>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.content.substring(0, 120)}...
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{article.wordCount} words</span>
                      <span>~{Math.ceil(article.wordCount / 40)} min read</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Article Preview */}
          {selectedArticle && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedArticle.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedArticle.category} • {selectedArticle.wordCount} words
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {selectedArticle.content.substring(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleStart}
              disabled={!selectedArticle || isLoading}
              className="flex-1"
              aria-describedby={!selectedArticle ? "no-article-selected" : undefined}
            >
              {isLoading ? "Starting..." : "Start Typing"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
          {!selectedArticle && (
            <p id="no-article-selected" className="sr-only">
              Please select an article before starting
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}