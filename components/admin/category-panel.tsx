'use client'

import { useState, useEffect, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSubcategoriesByCategory } from '@/lib/services/categories'
import type { Category, Subcategory } from '@/lib/types'

interface CategoryPanelProps {
  categories: Category[]
  selectedCategoryIds: string[]
  selectedSubcategoryIds: string[]
  isLead: boolean
  isSpecial: boolean
  onCategoryToggle: (catId: string) => void
  onSubcategoryToggle: (subId: string) => void
  onSpecialChange: (type: 'lead' | 'special' | 'none', index?: number) => void
  specialIndex?: number // 0 = lead, 1-9 = special 1-9
}

// Special article types - matching tool's GRID_POSITIONS
// slot 0 = lead, slot 1 = SP-1, slot 2 = SP-2, ..., slot 8 = SP-8
// "none" means this article is NOT assigned to any special slot (just a regular article)
const SPECIAL_ITEMS = [
  { value: 'none', label: '— কোনটি নয় (সাধারণ নিবন্ধ)', slot: -1 },
  { value: 'lead', label: '★ প্রধান নিবন্ধ (লিড)', slot: 0 },
  { value: 'special-1', label: 'SP-1', slot: 1 },
  { value: 'special-2', label: 'SP-2', slot: 2 },
  { value: 'special-3', label: 'SP-3', slot: 3 },
  { value: 'special-4', label: 'SP-4', slot: 4 },
  { value: 'special-5', label: 'EXTRA-1', slot: 5 },
  { value: 'special-6', label: 'EXTRA-2', slot: 6 },
  { value: 'special-7', label: 'SP-5', slot: 7 },
  { value: 'special-8', label: 'SP-6', slot: 8 },
  { value: 'special-9', label: 'SP-7', slot: 9 },
  { value: 'special-10', label: 'SP-8', slot: 10 },
]

export function CategoryPanel({
  categories,
  selectedCategoryIds,
  selectedSubcategoryIds,
  isLead,
  isSpecial,
  onCategoryToggle,
  onSubcategoryToggle,
  onSpecialChange,
  specialIndex,
}: CategoryPanelProps) {
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([])
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false)

  // Filter out "সর্বশেষ" category
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.slug !== 'latest' && cat.slug !== 'সর্বশেষ'),
    [categories]
  )

  // Load subcategories for ALL selected categories
  useEffect(() => {
    if (selectedCategoryIds.length > 0) {
      setSubcategoriesLoading(true)
      Promise.all(selectedCategoryIds.map((catId) => getSubcategoriesByCategory(catId)))
        .then((results) => {
          const merged = results.flat()
          // Deduplicate by id
          const unique = merged.filter(
            (sub, idx, self) => self.findIndex((s) => s.id === sub.id) === idx
          )
          setAllSubcategories(unique)
        })
        .catch((err) => console.error('Error loading subcategories:', err))
        .finally(() => setSubcategoriesLoading(false))
    } else {
      setAllSubcategories([])
    }
  }, [selectedCategoryIds])

  // All top-level subcategories (parentId === null) from selected categories
  // These appear inline in column 2 under their parent category (as divisions/branches)
  const topLevelSubcategories = useMemo(
    () => allSubcategories.filter((sub) => !sub.parentId),
    [allSubcategories]
  )

  // Selected top-level subcategory IDs (divisions selected in column 2)
  const selectedTopLevelIds = useMemo(
    () => selectedSubcategoryIds.filter((id) => topLevelSubcategories.some((d) => d.id === id)),
    [selectedSubcategoryIds, topLevelSubcategories]
  )

  // Districts: subcategories whose parentId matches a selected top-level subcategory (division)
  // These appear in column 3
  const districts = useMemo(() => {
    if (selectedTopLevelIds.length === 0) return []
    return allSubcategories.filter(
      (sub) => sub.parentId && selectedTopLevelIds.includes(sub.parentId)
    )
  }, [allSubcategories, selectedTopLevelIds])

  // Selected district IDs (subcategories checked in column 3)
  const selectedDistrictIds = useMemo(
    () =>
      selectedSubcategoryIds.filter((id) =>
        districts.some((d) => d.id === id)
      ),
    [selectedSubcategoryIds, districts]
  )

  // Upazilas: subcategories whose parentId matches a selected district
  const upazilas = useMemo(() => {
    if (selectedDistrictIds.length === 0) return []
    return allSubcategories.filter(
      (sub) => sub.parentId && selectedDistrictIds.includes(sub.parentId)
    )
  }, [allSubcategories, selectedDistrictIds])


  // Determine current special value


  // Default to 'none' when no special slot is selected (so "কোনটি নয়" is pre-selected)
  const currentSpecial = isLead ? 'lead' : isSpecial ? `special-${specialIndex || 1}` : 'none'

  return (
    <div className="space-y-3">
      <Label className="text-foreground font-semibold">বিভাগ, জেলা ও উপজেলা নির্বাচন</Label>
      <p className="text-xs text-muted-foreground">
        নিচের প্যানেল থেকে স্পেশাল, ক্যাটাগরি, জেলা ও উপজেলা নির্বাচন করুন
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Column 1: Special */}
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 border-b">
            <h4 className="text-sm font-semibold text-foreground">স্পেশাল</h4>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="p-2 space-y-0.5">
              {SPECIAL_ITEMS.map((item) => {
                const isSelected = currentSpecial === item.value
                return (
                  <label
                    key={item.value}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="special-article"
                      checked={isSelected}
                      onChange={() => {
                        if (item.value === 'none') {
                          // "None" selected — clear all special assignments
                          onSpecialChange('none')
                        } else if (item.value === 'lead') {
                          onSpecialChange('lead')
                        } else {
                          const idx = parseInt(item.value.split('-')[1])
                          onSpecialChange('special', idx)
                        }
                      }}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Column 2: Categories with inline subcategories */}
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 border-b">
            <h4 className="text-sm font-semibold text-foreground">ক্যাটাগরি</h4>
          </div>
          <ScrollArea className="h-[320px]">
            <div className="p-2 space-y-0.5">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id!)
                // Get top-level subcategories (parentId === null) for this category
                const catSubs = topLevelSubcategories.filter(
                  (sub: Subcategory) => sub.categoryId === cat.id
                )

                return (
                  <div key={cat.id}>
                    <label
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onCategoryToggle(cat.id!)}
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </label>
                    {/* Show subcategories inline when category is selected */}
                    {isSelected && catSubs.length > 0 && (
                      <div className="ml-5 pl-2 border-l-2 border-muted space-y-0.5 my-1">
                        {catSubs.map((sub) => {
                          const isSubSelected = selectedSubcategoryIds.includes(sub.id!)
                          return (
                            <label
                              key={sub.id}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                                isSubSelected
                                  ? 'bg-primary/5 border border-primary/20'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <Checkbox
                                checked={isSubSelected}
                                onCheckedChange={() => onSubcategoryToggle(sub.id!)}
                              />
                              <span className="text-xs">{sub.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {subcategoriesLoading && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              লোড হচ্ছে...
            </div>
          )}
        </div>



        {/* Column 3: Districts */}
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 border-b">
            <h4 className="text-sm font-semibold text-foreground">জেলা</h4>
          </div>
          {selectedTopLevelIds.length > 0 ? (
            <ScrollArea className="h-[320px]">
              <div className="p-2 space-y-0.5">
                {districts.length > 0 ? (
                  districts.map((dist) => {
                    const isSelected = selectedSubcategoryIds.includes(dist.id!)
                    return (
                      <label
                        key={dist.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onSubcategoryToggle(dist.id!)}
                        />
                        <span className="text-sm">{dist.name}</span>
                      </label>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    নির্বাচিত বিভাগে কোনো জেলা নেই
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[320px] flex items-center justify-center p-4">
              <p className="text-xs text-muted-foreground text-center">
                প্রথমে ক্যাটাগরি থেকে একটি বিভাগ নির্বাচন করুন
              </p>
            </div>
          )}
        </div>


        {/* Column 4: Upazilas */}
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 border-b">
            <h4 className="text-sm font-semibold text-foreground">উপজেলা</h4>
          </div>
          {selectedDistrictIds.length > 0 ? (
            <ScrollArea className="h-[320px]">
              <div className="p-2 space-y-0.5">
                {upazilas.length > 0 ? (
                  upazilas.map((upazila) => {
                    const isSelected = selectedSubcategoryIds.includes(upazila.id!)
                    return (
                      <label
                        key={upazila.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onSubcategoryToggle(upazila.id!)}
                        />
                        <span className="text-sm">{upazila.name}</span>
                      </label>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    নির্বাচিত জেলায় কোনো উপজেলা নেই
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[320px] flex items-center justify-center p-4">
              <p className="text-xs text-muted-foreground text-center">
                প্রথমে জেলা নির্বাচন করুন
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected items summary */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {currentSpecial && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {SPECIAL_ITEMS.find((i) => i.value === currentSpecial)?.label}
          </span>
        )}
        {selectedCategoryIds.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {selectedCategoryIds.length}টি ক্যাটাগরি
          </span>
        )}
        {selectedTopLevelIds.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {selectedTopLevelIds.length}টি বিভাগ
          </span>
        )}
        {selectedDistrictIds.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {selectedDistrictIds.length}টি জেলা
          </span>
        )}
        {selectedSubcategoryIds.filter(
          (id) =>
            !selectedTopLevelIds.includes(id) && !selectedDistrictIds.includes(id)
        ).length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {
              selectedSubcategoryIds.filter(
                (id) =>
                  !selectedTopLevelIds.includes(id) &&
                  !selectedDistrictIds.includes(id)
              ).length
            }
            টি উপজেলা
          </span>
        )}
      </div>
    </div>
  )
}
