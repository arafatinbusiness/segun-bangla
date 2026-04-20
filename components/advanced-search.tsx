'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '@/lib/types'

export interface SearchFilters {
  query: string
  category?: string
  sortBy: 'recent' | 'popular' | 'relevant'
  dateRange?: 'week' | 'month' | 'year' | 'all'
}

interface AdvancedSearchProps {
  categories: Category[]
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function AdvancedSearch({
  categories,
  onSearch,
  isLoading = false,
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'recent',
    dateRange: 'all',
  })

  const handleSearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleQueryChange = (value: string) => {
    setFilters({ ...filters, query: value })
  }

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value === 'all' ? undefined : value,
    })
  }

  const handleSortChange = (value: 'recent' | 'popular' | 'relevant') => {
    setFilters({ ...filters, sortBy: value })
  }

  const handleDateRangeChange = (
    value: 'week' | 'month' | 'year' | 'all'
  ) => {
    setFilters({ ...filters, dateRange: value })
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      sortBy: 'recent',
      dateRange: 'all',
    })
  }

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.sortBy !== 'recent' ||
    filters.dateRange !== 'all'

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="সংবাদ, বিভাগ বা লেখক খুঁজুন..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !filters.query}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          খুঁজুন
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          ফিল্টার
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted p-6 rounded-lg border space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">উন্নত অনুসন্ধান</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                ফিল্টার মুছুন
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                বিভাগ
              </label>
              <Select
                value={filters.category || 'all'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="সব বিভাগ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বিভাগ</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                সাজান
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">সর্বশেষ প্রথম</SelectItem>
                  <SelectItem value="popular">জনপ্রিয় প্রথম</SelectItem>
                  <SelectItem value="relevant">প্রাসঙ্গিকতা</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                সময়কাল
              </label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">এই সপ্তাহ</SelectItem>
                  <SelectItem value="month">এই মাস</SelectItem>
                  <SelectItem value="year">এই বছর</SelectItem>
                  <SelectItem value="all">সব সময়</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isLoading || !filters.query}
                className="w-full"
              >
                {isLoading ? 'অনুসন্ধান করছি...' : 'অনুসন্ধান করুন'}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {filters.query && (
                <div className="bg-background px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>"{filters.query}"</span>
                  <button
                    onClick={() => handleQueryChange('')}
                    className="hover:text-foreground text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.category && (
                <div className="bg-background px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>
                    {categories.find((c) => c.id === filters.category)?.name}
                  </span>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="hover:text-foreground text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.sortBy !== 'recent' && (
                <div className="bg-background px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>
                    সাজান: {filters.sortBy === 'popular' ? 'জনপ্রিয়' : 'প্রাসঙ্গিকতা'}
                  </span>
                  <button
                    onClick={() => handleSortChange('recent')}
                    className="hover:text-foreground text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.dateRange !== 'all' && (
                <div className="bg-background px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>
                    সময়কাল:{' '}
                    {filters.dateRange === 'week'
                      ? 'এই সপ্তাহ'
                      : filters.dateRange === 'month'
                        ? 'এই মাস'
                        : 'এই বছর'}
                  </span>
                  <button
                    onClick={() => handleDateRangeChange('all')}
                    className="hover:text-foreground text-muted-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
