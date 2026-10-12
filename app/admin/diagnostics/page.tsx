'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  runCategoryDiagnostics,
  repairCategorySchema,
  CategoryDiagnosticReport,
  KNOWN_CATEGORY_IDS,
} from '@/lib/services/category-diagnostics'
import {
  Activity,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  Wrench,
  ExternalLink,
  Share2,
} from 'lucide-react'

export default function DiagnosticsPage() {
  const [selectedCatId, setSelectedCatId] = useState<string>(KNOWN_CATEGORY_IDS.JATIYO)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<CategoryDiagnosticReport | null>(null)
  const [copied, setCopied] = useState(false)
  const [fixing, setFixing] = useState(false)

  const loadData = async (catId: string) => {
    setLoading(true)
    try {
      const data = await runCategoryDiagnostics(catId)
      setReport(data)
    } catch (err) {
      console.error('Failed to load diagnostics:', err)
      toast.error('Failed to load diagnostic data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedCatId)
  }, [selectedCatId])

  const handleCopyReport = async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report.markdownSummary)
      setCopied(true)
      toast.success('Diagnostic report copied! You can paste this directly to the AI assistant.', {
        duration: 4000,
      })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleAutoRepair = async () => {
    if (!report) return
    setFixing(true)
    try {
      const res = await repairCategorySchema(report.categoryId)
      toast.success(`Repaired ${res.fixedCount} article(s) successfully!`)
      await loadData(selectedCatId)
    } catch (e) {
      console.error(e)
      toast.error('Schema repair failed')
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Category Diagnostics & Logs
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Live database inspection, slot audits, and auto-diagnosis for Jatiyo & Rajniti homepage rows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(selectedCatId)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={handleCopyReport}
            disabled={!report || loading}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Full Diagnostic Report'}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Button
          variant={selectedCatId === KNOWN_CATEGORY_IDS.JATIYO ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCatId(KNOWN_CATEGORY_IDS.JATIYO)}
          className="gap-2 rounded-lg"
        >
          <Layers className="w-4 h-4" />
          জাতীয় (National / Jatiyo)
        </Button>
        <Button
          variant={selectedCatId === KNOWN_CATEGORY_IDS.RAJNITI ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCatId(KNOWN_CATEGORY_IDS.RAJNITI)}
          className="gap-2 rounded-lg"
        >
          <Layers className="w-4 h-4" />
          রাজনীতি (Politics / Rajniti)
        </Button>
      </div>

      {loading && (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p>Running live Firestore database audit...</p>
        </div>
      )}

      {!loading && report && (
        <>
          {/* Alert Banner if generic limit is exceeded */}
          {report.isLimitExceeded ? (
            <Card className="p-4 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">
                    Generic Fetch Limit (200) Exceeded — Root Cause Detected!
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    The database contains <strong>{report.totalArticlesInDb} total articles</strong> and{' '}
                    <strong>{report.totalArticlesInDb} in this category</strong>, but only{' '}
                    <strong>{report.articlesInTop200} articles</strong> were in the homepage top-200 batch.
                    Over 1–2 months, active publishing in other categories pushed older articles out of client memory.
                    The auto-heal system will directly query Firestore for this category to prevent empty slots.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Category Memory Pool Healthy</h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    This category currently has {report.articlesInTop200} articles in the active pool. All slots can be safely filled.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1 bg-card/60 backdrop-blur">
              <p className="text-xs font-medium text-muted-foreground">Category ID</p>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono font-bold text-primary truncate max-w-[170px]">
                  {report.categoryId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    navigator.clipboard.writeText(report.categoryId)
                    toast.success('Category ID copied')
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Slug: <span className="font-mono">{report.categorySlug}</span>
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-card/60 backdrop-blur">
              <p className="text-xs font-medium text-muted-foreground">Total In Category (DB)</p>
              <p className="text-2xl font-bold text-foreground">
                {report.totalArticlesInDb}
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                Lifetime published articles in Firestore
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-card/60 backdrop-blur">
              <p className="text-xs font-medium text-muted-foreground">In Homepage Cutoff (Top 200)</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {report.articlesInTop200}
                </p>
                <Badge variant={report.articlesInTop200 >= 7 ? 'outline' : 'destructive'} className="text-[10px]">
                  {report.articlesInTop200 >= 7 ? 'Sufficient' : 'Shortage'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Target: At least 7 articles for full row
              </p>
            </Card>

            <Card className="p-4 space-y-1 bg-card/60 backdrop-blur">
              <p className="text-xs font-medium text-muted-foreground">Beyond Top-200 Limit</p>
              <p className="text-2xl font-bold text-foreground">
                {report.articlesBeyondTop200}
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                Older articles pushed out by other categories
              </p>
            </Card>
          </div>

          {/* Interactive Slot Movement & Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Homepage Row Slot Map (7 Articles + 1 Social Card)
                </h3>
                <p className="text-xs text-muted-foreground">
                  The exact 2-row x 4-column layout displayed on the live homepage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {report.slots.map((slot) => {
                if (slot.type === 'social_card') {
                  return (
                    <Card
                      key={`slot-${slot.slotNumber}`}
                      className="p-4 flex flex-col justify-between border-dashed border-primary/40 bg-primary/5 min-h-[160px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[10px]">
                            {slot.slotLabel}
                          </Badge>
                          <Share2 className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">Social Media Card</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dedicated Facebook / Social Widget card (occupies Slot 5).
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/30">
                        <span className="text-[10px] text-primary font-medium">Fixed Placement (Healthy)</span>
                      </div>
                    </Card>
                  )
                }

                const isFilled = slot.status === 'filled' && slot.article
                return (
                  <Card
                    key={`slot-${slot.slotNumber}`}
                    className={`p-4 flex flex-col justify-between min-h-[160px] ${
                      isFilled ? 'bg-card' : 'border-destructive/40 bg-destructive/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px]">
                          {slot.slotLabel}
                        </Badge>
                        <Badge
                          variant={isFilled ? 'default' : 'destructive'}
                          className="text-[10px]"
                        >
                          {isFilled ? 'Filled' : 'EMPTY'}
                        </Badge>
                      </div>

                      {isFilled ? (
                        <>
                          <h4 className="font-bold text-xs line-clamp-2 text-foreground">
                            {slot.article!.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Published: {slot.article!.publishedAtFormatted}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-destructive">
                            ⚠️ Slot Missing
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {slot.emptyReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                      {isFilled ? (
                        <>
                          <span className="font-mono truncate max-w-[110px]">
                            ID: {slot.article!.id.substring(0, 8)}...
                          </span>
                          <a
                            href={`/article/${slot.article!.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-primary hover:underline"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      ) : (
                        <span className="text-destructive font-medium">Requires Auto-Heal</span>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Client-Side & Admin Upload Checks */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Client & Admin Upload Data Health Check
                </h3>
                <p className="text-xs text-muted-foreground">
                  Detects unpublished drafts, future timestamps, or category schema mismatches that prevent articles from showing.
                </p>
              </div>

              {report.inconsistencies.missingArrayCategory.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAutoRepair}
                  disabled={fixing}
                  className="gap-2 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Wrench className={`w-3.5 h-3.5 ${fixing ? 'animate-spin' : ''}`} />
                  {fixing ? 'Repairing...' : `Fix ${report.inconsistencies.missingArrayCategory.length} Schema Mismatches`}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">Unpublished / Drafts</h4>
                  <Badge variant={report.inconsistencies.unpublishedArticles.length > 0 ? 'destructive' : 'outline'}>
                    {report.inconsistencies.unpublishedArticles.length}
                  </Badge>
                </div>
                {report.inconsistencies.unpublishedArticles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No unpublished articles hiding in category.</p>
                ) : (
                  <ul className="text-xs space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
                    {report.inconsistencies.unpublishedArticles.map(a => (
                      <li key={a.id} className="truncate">• [{a.status}] {a.title}</li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">Future-Dated (Scheduled)</h4>
                  <Badge variant={report.inconsistencies.futureDatedArticles.length > 0 ? 'destructive' : 'outline'}>
                    {report.inconsistencies.futureDatedArticles.length}
                  </Badge>
                </div>
                {report.inconsistencies.futureDatedArticles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No articles with future timestamps.</p>
                ) : (
                  <ul className="text-xs space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
                    {report.inconsistencies.futureDatedArticles.map(a => (
                      <li key={a.id} className="truncate">• {a.title} ({a.dateStr})</li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">Legacy categoryId Only</h4>
                  <Badge variant={report.inconsistencies.missingArrayCategory.length > 0 ? 'secondary' : 'outline'}>
                    {report.inconsistencies.missingArrayCategory.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.inconsistencies.missingArrayCategory.length} article(s) have <code>categoryId</code> but missing from <code>categoryIds</code> array.
                </p>
                {report.inconsistencies.missingArrayCategory.length > 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Handled safely by the upgraded query fallback.
                  </p>
                )}
              </Card>
            </div>
          </div>

          {/* Copy Report Preview Section */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Generated Diagnostic Report (Ready to Copy)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click the button below or at the top of the page to copy this report and paste it to the assistant whenever needed.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="gap-2 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Report'}
              </Button>
            </div>

            <Card className="p-4 bg-muted/30 border-border/60">
              <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground overflow-x-auto max-h-96 whitespace-pre-wrap">
                {report.markdownSummary}
              </pre>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
