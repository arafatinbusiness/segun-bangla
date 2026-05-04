'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import { validateSlug, generateCleanSlug, type SlugValidation } from '@/lib/slug-utils'

interface SlugInputProps {
  value: string
  onChange: (value: string) => void
  onAutoGenerate?: () => string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  basePath?: string
}

export function SlugInput({
  value,
  onChange,
  onAutoGenerate,
  label = 'স্লাগ (URL)',
  placeholder = 'my-slug',
  required = false,
  disabled = false,
  basePath = '/category/',
}: SlugInputProps) {
  const [validation, setValidation] = useState<SlugValidation | null>(null)
  const [touched, setTouched] = useState(false)
  const [domain, setDomain] = useState('')

  useEffect(() => {
    // Get the full domain dynamically from window.location
    if (typeof window !== 'undefined') {
      setDomain(window.location.origin)
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)
      if (touched || newValue.length > 0) {
        setValidation(validateSlug(newValue))
      }
    },
    [onChange, touched]
  )

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (value) {
      setValidation(validateSlug(value))
    }
  }, [value])

  const handleAutoGenerate = useCallback(() => {
    if (onAutoGenerate) {
      const slug = onAutoGenerate()
      onChange(slug)
      setTouched(true)
      setValidation(validateSlug(slug))
    }
  }, [onAutoGenerate, onChange])

  const handleApplySuggestion = useCallback(
    (suggestion: string) => {
      onChange(suggestion)
      setValidation(validateSlug(suggestion))
    },
    [onChange]
  )

  const showValidation = touched && value.length > 0
  const isValid = showValidation && validation?.isValid
  const hasErrors = showValidation && validation && !validation.isValid

  return (
    <div className="space-y-2">
      <Label htmlFor="slug" className="text-foreground font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="slug"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full pr-8 ${
              hasErrors
                ? 'border-red-500 focus-visible:ring-red-500'
                : isValid
                ? 'border-green-500 focus-visible:ring-green-500'
                : ''
            }`}
            required={required}
            disabled={disabled}
          />
          {showValidation && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : hasErrors ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoGenerate}
          className="shrink-0 gap-1.5"
          disabled={disabled}
        >
          <Sparkles className="w-3.5 h-3.5" />
          অটো
        </Button>
      </div>

      {/* URL Preview - shows full domain URL */}
      {value && (
        <p className="text-xs text-muted-foreground font-mono">
          {domain && (
            <span className="text-muted-foreground/60">{domain}</span>
          )}
          {basePath}
          <span className={hasErrors ? 'text-red-500' : 'text-primary'}>
            {value}
          </span>
        </p>
      )}

      {/* Validation Messages */}
      {showValidation && validation && !validation.isValid && (
        <div className="space-y-2 mt-2">
          {/* Error Messages */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, i) => (
                <div
                  key={`error-${i}`}
                  className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {validation.suggestions.length > 0 && (
            <div className="space-y-1">
              {validation.suggestions.map((suggestion, i) => {
                // Extract the suggested slug from the suggestion text
                const match = suggestion.match(/"([^"]+)"/)
                const suggestedSlug = match ? match[1] : null

                return (
                  <div
                    key={`suggestion-${i}`}
                    className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
                  >
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="flex-1">{suggestion}</span>
                    {suggestedSlug && suggestedSlug !== value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-xs shrink-0"
                        onClick={() => handleApplySuggestion(suggestedSlug)}
                      >
                        প্রয়োগ করুন
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {showValidation && isValid && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>স্লাগ বৈধ</span>
        </div>
      )}
    </div>
  )
}
