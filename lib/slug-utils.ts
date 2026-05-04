export interface SlugValidation {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  sanitized: string
}

/**
 * Validates a slug and returns errors and suggestions.
 * A valid slug should:
 * - Only contain lowercase letters, numbers, and hyphens
 * - Not start or end with a hyphen
 * - Not contain spaces
 * - Not contain special characters
 * - Not contain uppercase letters
 * - Not be empty
 */
export function validateSlug(slug: string): SlugValidation {
  const errors: string[] = []
  const suggestions: string[] = []
  let sanitized = slug.trim()

  // Empty check
  if (!sanitized) {
    return {
      isValid: false,
      errors: ['স্লাগ খালি হতে পারে না'],
      suggestions: ['একটি বৈধ স্লাগ লিখুন (যেমন: my-slug)'],
      sanitized: '',
    }
  }

  // Check for spaces
  if (/\s/.test(sanitized)) {
    errors.push('স্লাগে স্পেস থাকতে পারে না')
    const suggested = sanitized.replace(/\s+/g, '-').toLowerCase()
    suggestions.push(`স্পেসের পরিবর্তে হাইফেন ব্যবহার করুন: "${suggested}"`)
    sanitized = suggested
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(sanitized)) {
    errors.push('স্লাগে বড় হাতের অক্ষর থাকতে পারে না')
    const suggested = sanitized.toLowerCase()
    suggestions.push(`ছোট হাতের অক্ষর ব্যবহার করুন: "${suggested}"`)
    sanitized = suggested
  }

  // Check for special characters (only allow a-z, 0-9, -)
  const specialChars = sanitized.match(/[^a-z0-9-]/g)
  if (specialChars) {
    const uniqueChars = [...new Set(specialChars)].join(', ')
    errors.push(`স্লাগে অননুমোদিত অক্ষর রয়েছে: ${uniqueChars}`)
    const suggested = sanitized
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    if (suggested) {
      suggestions.push(`শুধুমাত্র a-z, 0-9 এবং হাইফেন ব্যবহার করুন: "${suggested}"`)
    } else {
      suggestions.push('শুধুমাত্র a-z, 0-9 এবং হাইফেন ব্যবহার করুন')
    }
    sanitized = suggested
  }

  // Check for leading/trailing hyphens
  if (/^-/.test(sanitized)) {
    errors.push('স্লাগ হাইফেন দিয়ে শুরু হতে পারে না')
    const suggested = sanitized.replace(/^-+/, '')
    if (suggested) {
      suggestions.push(`শুরু থেকে হাইফেন সরান: "${suggested}"`)
    }
    sanitized = suggested
  }

  if (/-$/.test(sanitized)) {
    errors.push('স্লাগ হাইফেন দিয়ে শেষ হতে পারে না')
    const suggested = sanitized.replace(/-+$/, '')
    if (suggested) {
      suggestions.push(`শেষ থেকে হাইফেন সরান: "${suggested}"`)
    }
    sanitized = suggested
  }

  // Check for consecutive hyphens
  if (/--/.test(sanitized)) {
    errors.push('স্লাগে একাধিক হাইফেন থাকতে পারে না')
    const suggested = sanitized.replace(/-+/g, '-')
    suggestions.push(`একাধিক হাইফেন একটিতে পরিবর্তন করুন: "${suggested}"`)
    sanitized = suggested
  }

  // Check for Bengali/non-ASCII characters
  if (/[^\x00-\x7F]/.test(slug)) {
    errors.push('স্লাগে ইউনিকোড অক্ষর (বাংলা, আরবি ইত্যাদি) থাকতে পারে না')
    const suggested = slug
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .trim()
    if (suggested) {
      suggestions.push(`শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন: "${suggested}"`)
    } else {
      suggestions.push('শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করুন')
    }
  }

  // Check for numbers only
  if (/^\d+$/.test(sanitized)) {
    errors.push('স্লাগ শুধুমাত্র সংখ্যা হতে পারে না')
    suggestions.push('স্লাগে অক্ষর এবং সংখ্যা উভয়ই থাকা উচিত')
  }

  // Check minimum length
  if (sanitized.length < 2) {
    errors.push('স্লাগ খুব ছোট (ন্যূনতম ২ অক্ষর প্রয়োজন)')
  }

  // Check maximum length
  if (sanitized.length > 100) {
    errors.push('স্লাগ খুব বড় (সর্বোচ্চ ১০০ অক্ষর)')
    const suggested = sanitized.slice(0, 100).replace(/-+$/, '')
    suggestions.push(`স্লাগ ছোট করুন: "${suggested}"`)
    sanitized = suggested
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: [...new Set(suggestions)],
    sanitized,
  }
}

/**
 * Generates a clean slug from a title/name string
 */
export function generateCleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Spaces to hyphens
    .replace(/-+/g, '-')      // Collapse hyphens
    .replace(/^-+|-+$/g, '')  // Trim hyphens
}
