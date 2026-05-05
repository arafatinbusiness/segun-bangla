/**
 * Social Card Generator
 * Generates a downloadable photo card for social media sharing.
 * Uses a "Top-Down Narrative" structure:
 *   1. Visual Background (Top 50-60%) - Article image with dark gradient vignette
 *   2. Publication Date (Center-Top) - Centered, white/light gray
 *   3. Main Headline/Title (Center Section) - Centered, largest font, bold white
 *   4. Call to Action (Bottom-Left) - "বিস্তারিত কমেন্টে..."
 *   5. Branding & Source (Bottom Footer) - URL left, logo right
 * Supports Bangla text rendering via Canvas API.
 */

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630

// Brand colors
const COLORS = {
  primary: '#8B0000',
  darkBg: '#1A1A1A',
  white: '#FFFFFF',
  lightGray: '#CCCCCC',
  mediumGray: '#888888',
  darkText: '#1A1A1A',
  accent: '#FF0000',
}

interface SocialCardData {
  title: string
  date: string
  imageUrl?: string
}

/**
 * Load an image from a URL and return an HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

/**
 * Draw wrapped text on canvas with Bangla support
 * Returns the Y position after the last line drawn
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  align: CanvasTextAlign = 'left'
): number {
  ctx.textAlign = align

  // For Bangla text, split by spaces first, then character-by-character if needed
  const words = text.split(' ')
  let line = ''
  let lines = 0
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && line) {
      // Draw current line
      const lineX = align === 'center' ? x : x
      ctx.fillText(line, lineX, currentY)
      line = words[i]
      currentY += lineHeight
      lines++
      if (lines >= maxLines) {
        return currentY
      }
    } else {
      line = testLine
    }
  }

  if (line) {
    ctx.fillText(line, align === 'center' ? x : x, currentY)
    lines++
  }

  return currentY
}

/**
 * Generate a social media card image and trigger download
 */
export async function generateAndDownloadSocialCard(
  data: SocialCardData,
  filename: string = 'social-card.png'
): Promise<void> {
  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // ============================================================
  // 1. VISUAL BACKGROUND (Top 50-60%)
  // ============================================================
  // Fill with dark background first (in case image fails)
  ctx.fillStyle = COLORS.darkBg
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const imageSectionHeight = Math.round(CARD_HEIGHT * 0.58) // ~365px (58% of 630)

  if (data.imageUrl) {
    try {
      const img = await loadImage(data.imageUrl)
      // Draw image covering the top section
      ctx.drawImage(img, 0, 0, CARD_WIDTH, imageSectionHeight)

      // Dark gradient (vignette) at bottom of image for text legibility
      const gradient = ctx.createLinearGradient(0, imageSectionHeight - 120, 0, imageSectionHeight)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.4)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, imageSectionHeight - 120, CARD_WIDTH, 120)
    } catch {
      // If image fails, use solid brand color
      ctx.fillStyle = COLORS.primary
      ctx.fillRect(0, 0, CARD_WIDTH, imageSectionHeight)
    }
  } else {
    // No image - use brand colored area
    ctx.fillStyle = COLORS.primary
    ctx.fillRect(0, 0, CARD_WIDTH, imageSectionHeight)
  }

  // Darken the entire image section slightly for text contrast
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(0, 0, CARD_WIDTH, imageSectionHeight)

  // ============================================================
  // 2. PUBLICATION DATE (Center-Top, within image section)
  // ============================================================
  const dateY = imageSectionHeight - 100
  ctx.fillStyle = COLORS.lightGray
  ctx.font = '18px "Noto Sans Bengali", "Siyam Rupali", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.date, CARD_WIDTH / 2, dateY)

  // ============================================================
  // 3. MAIN HEADLINE/TITLE (Center Section)
  // ============================================================
  const titleMaxWidth = CARD_WIDTH - 120
  const titleFontSize = data.title.length > 80 ? 28 : data.title.length > 50 ? 32 : 36
  const titleY = dateY + 20

  ctx.fillStyle = COLORS.white
  ctx.font = `bold ${titleFontSize}px "Noto Sans Bengali", "Siyam Rupali", Arial, sans-serif`
  ctx.textAlign = 'center'

  drawWrappedText(
    ctx,
    data.title,
    CARD_WIDTH / 2,
    titleY + titleFontSize,
    titleMaxWidth,
    titleFontSize + 10,
    3,
    'center'
  )

  // ============================================================
  // 4. CALL TO ACTION (Bottom-Left)
  // ============================================================
  const ctaY = CARD_HEIGHT - 70
  ctx.fillStyle = COLORS.accent
  ctx.font = 'bold 18px "Noto Sans Bengali", "Siyam Rupali", Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('বিস্তারিত কমেন্টে...', 40, ctaY)

  // ============================================================
  // 5. BRANDING & SOURCE (Bottom Footer)
  // ============================================================
  // Bottom dark strip
  ctx.fillStyle = COLORS.darkBg
  ctx.fillRect(0, CARD_HEIGHT - 45, CARD_WIDTH, 45)

  // Website URL - bottom left
  ctx.fillStyle = COLORS.white
  ctx.font = 'bold 16px "Noto Sans Bengali", "Siyam Rupali", Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('www.segunbangla.com', 40, CARD_HEIGHT - 16)

  // Logo - bottom right
  try {
    const logoImg = await loadImage('/logo.png')
    const logoHeight = 30
    const logoWidth = (logoImg.naturalWidth / logoImg.naturalHeight) * logoHeight
    const logoX = CARD_WIDTH - 40 - logoWidth
    const logoY = CARD_HEIGHT - 45 + (45 - logoHeight) / 2
    ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)
  } catch {
    // If logo fails to load, render text fallback
    ctx.fillStyle = COLORS.white
    ctx.font = 'bold 18px "Noto Sans Bengali", "Siyam Rupali", Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('সেগুন বাংলা', CARD_WIDTH - 40, CARD_HEIGHT - 16)
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create image blob'))
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}
