/**
 * Social Card Generator
 * Generates a downloadable photo card for social media sharing.
 * Renders directly on Canvas for reliable PNG export.
 *
 * Solid Footer Block Layout (Teak Wood Theme):
 *   1. Top Branding Bar (4% height) - Teak brown bg, brand name left, date right
 *   2. Main News Image (55% height) - Clear, sharp, no overlays
 *   3. Branding Strip (5% height) - Black bg with centered logo
 *   4. Solid Teak Footer (35% height) - Dark teak brown bg, centered title, CTA
 *
 * Aspect Ratios Supported:
 *   - 'facebook'  : 1080×1350 (4:5)    - Facebook Feed Post (recommended ratio)
 *   - 'square'    : 1080×1080 (1:1)    - Instagram Feed
 *   - 'story'     : 1080×1920 (9:16)   - Instagram Story, TikTok, Facebook Story
 */

export type SocialCardFormat = 'facebook' | 'square' | 'story' | 'passport'

interface CardDimensions {
  width: number
  height: number
}

const FORMAT_DIMENSIONS: Record<SocialCardFormat, CardDimensions> = {
  facebook: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  passport: { width: 1080, height: 1350 },
}

interface SocialCardData {
  title: string
  date: string
  imageUrl?: string
}

/**
 * Draw wrapped text on canvas, centered horizontally and vertically within a region.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number,
  fontSize: number,
  color: string
): void {
  ctx.fillStyle = color
  ctx.font = `bold ${fontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // Split into words
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  // Calculate total text height
  const totalHeight = lines.length * lineHeight

  // Start Y position to center vertically
  let startY = y + (maxHeight - totalHeight) / 2

  // Draw each line
  for (const line of lines) {
    ctx.fillText(line, x, startY)
    startY += lineHeight
  }
}

/**
 * Generate a social media card and open it in a new tab for saving.
 * Renders directly on Canvas for reliable PNG download.
 */
export async function generateAndDownloadSocialCard(
  data: SocialCardData,
  filename: string = 'social-card.png',
  format: SocialCardFormat = 'facebook',
  onProgress?: (message: string) => void
): Promise<void> {
  const dims = FORMAT_DIMENSIONS[format]
  const W = dims.width
  const H = dims.height

  onProgress?.('সোশ্যাল কার্ড তৈরি হচ্ছে...')

  // ─── Layout Calculations ────────────────────────────────────────────────
  const headerHeight = Math.round(H * 0.04)
  const imageHeight = Math.round(H * 0.55)
  const brandingStripHeight = Math.round(H * 0.05)
  const footerHeight = Math.round(H * 0.35)

  const paddingX = Math.round(W * 0.05)
  const footerPaddingY = Math.round(H * 0.04)

  // Font sizes
  const brandFontSize = Math.round(H * 0.026)
  const dateFontSize = Math.round(H * 0.022)
  const titleFontSize = data.title.length > 80
    ? Math.round(H * 0.038)
    : data.title.length > 50
      ? Math.round(H * 0.042)
      : Math.round(H * 0.048)
  const ctaFontSize = Math.round(H * 0.024)

  // ─── Create Canvas ──────────────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ─── 1. Draw Header Strip (Teak wood background) ────────────────────────
  ctx.fillStyle = '#8B5E3C'
  ctx.fillRect(0, 0, W, headerHeight)

  // Brand name "Segun Bangla" - left aligned
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${brandFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Segun Bangla', paddingX, headerHeight / 2)

  // Date - right aligned
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `${dateFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText(data.date, W - paddingX, headerHeight / 2)

  // ─── 2. Draw Image ──────────────────────────────────────────────────────
  const imageTop = headerHeight

  if (data.imageUrl) {
    let img: HTMLImageElement | null = null
    try {
      img = await loadImage(data.imageUrl)
    } catch (e) {
      console.error('Failed to load image for social card:', e)
    }

    if (img) {
      if (format === 'passport') {
        // Passport format: show image as a small centered square with white border
        // Fill the background with a soft gray
        ctx.fillStyle = '#E8E0D8'
        ctx.fillRect(0, imageTop, W, imageHeight)

        // Calculate passport photo size (square, ~40% of image area width)
        const passportSize = Math.round(W * 0.38)
        const passportX = Math.round((W - passportSize) / 2)
        const passportY = Math.round(imageTop + (imageHeight - passportSize) / 2)

        // Draw white border (like a passport photo)
        const borderSize = 6
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(passportX - borderSize, passportY - borderSize, passportSize + borderSize * 2, passportSize + borderSize * 2)

        // Draw shadow under the photo
        ctx.shadowColor = 'rgba(0,0,0,0.15)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 3
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(passportX - borderSize, passportY - borderSize, passportSize + borderSize * 2, passportSize + borderSize * 2)
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Draw the image centered and cropped to square
        const imgMin = Math.min(img.naturalWidth, img.naturalHeight)
        const imgSx = (img.naturalWidth - imgMin) / 2
        const imgSy = (img.naturalHeight - imgMin) / 2
        ctx.drawImage(img, imgSx, imgSy, imgMin, imgMin, passportX, passportY, passportSize, passportSize)

        // Draw subtle watermark below the passport photo
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        ctx.font = `${Math.round(H * 0.016)}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('segunbangla.com', W / 2, passportY + passportSize + borderSize + 8)
      } else {
        // Standard format: draw image to fill the image area (cover)
        const imgAspect = img.naturalWidth / img.naturalHeight
        const areaAspect = W / imageHeight

        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight

        if (imgAspect > areaAspect) {
          // Image is wider - crop sides
          sh = img.naturalHeight
          sw = sh * areaAspect
          sx = (img.naturalWidth - sw) / 2
        } else {
          // Image is taller - crop top/bottom
          sw = img.naturalWidth
          sh = sw / areaAspect
          sy = (img.naturalHeight - sh) / 2
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, imageTop, W, imageHeight)

        // Draw subtle watermark over the image
        ctx.save()
        ctx.translate(W / 2, imageTop + imageHeight / 2)
        ctx.rotate(-Math.PI / 6)
        ctx.fillStyle = 'rgba(255,255,255,0.12)'
        ctx.font = `bold ${Math.round(W * 0.06)}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('www.segunbangla.com', 0, 0)
        ctx.restore()
      }
    } else {
      // Image failed to load: gray placeholder
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, imageTop, W, imageHeight)
      ctx.fillStyle = '#999999'
      ctx.font = `bold ${Math.round(W * 0.04)}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('সেগুন বাংলা', W / 2, imageTop + imageHeight / 2)
    }
  } else {
    // No image: gray placeholder
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, imageTop, W, imageHeight)
    ctx.fillStyle = '#999999'
    ctx.font = `bold ${Math.round(W * 0.04)}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('সেগুন বাংলা', W / 2, imageTop + imageHeight / 2)
  }

  // ─── 3. Branding Strip (between image and footer) ───────────────────────
  const brandingStripTop = headerHeight + imageHeight
  ctx.fillStyle = '#5C3317'
  ctx.fillRect(0, brandingStripTop, W, brandingStripHeight)

  // Load and draw logo centered in the branding strip
  let logoImg: HTMLImageElement | null = null
  try {
    logoImg = await loadImage('/logo.png')
  } catch {
    // Logo not available
  }

  if (logoImg) {
    const stripLogoHeight = Math.round(brandingStripHeight * 0.7)
    const stripLogoWidth = Math.round(stripLogoHeight * (logoImg.naturalWidth / logoImg.naturalHeight))
    const stripLogoX = Math.round((W - stripLogoWidth) / 2)
    const stripLogoY = Math.round(brandingStripTop + (brandingStripHeight - stripLogoHeight) / 2)
    ctx.drawImage(logoImg, stripLogoX, stripLogoY, stripLogoWidth, stripLogoHeight)
  }

  // ─── 4. Draw Footer (Solid Teak Wood) ───────────────────────────────────
  const footerTop = brandingStripTop + brandingStripHeight

  ctx.fillStyle = '#5C3317'
  ctx.fillRect(0, footerTop, W, footerHeight)

  // Title area - centered in the footer (leaving space for CTA at bottom)
  const titleAreaTop = footerTop + footerPaddingY
  const titleAreaHeight = footerHeight - footerPaddingY * 2 - Math.round(ctaFontSize * 2.5)
  const titleMaxWidth = W - paddingX * 2

  // Draw title with text shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 1

  drawWrappedText(
    ctx,
    data.title,
    W / 2,
    titleAreaTop,
    titleMaxWidth,
    titleAreaHeight,
    Math.round(titleFontSize * 1.4),
    titleFontSize,
    '#FFFFFF'
  )

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // ─── 5. Draw CTA ────────────────────────────────────────────────────────
  const ctaText = 'বিস্তারিত কমেন্টে'
  const ctaY = footerTop + footerHeight - Math.round(H * 0.035) - ctaFontSize

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `${ctaFontSize}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  const ctaFullText = `« ${ctaText} »`
  const ctaMetrics = ctx.measureText(ctaFullText)
  const ctaWidth = ctaMetrics.width

  // Draw underline
  const underlineY = ctaY + Math.round(H * 0.008)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - ctaWidth / 2, underlineY)
  ctx.lineTo(W / 2 + ctaWidth / 2, underlineY)
  ctx.stroke()

  // Draw CTA text
  ctx.fillText(ctaFullText, W / 2, ctaY)

  // ─── 6. Branding Watermark ──────────────────────────────────────────────
  const watermarkY = footerTop + footerHeight - Math.round(H * 0.012)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = `bold ${Math.round(H * 0.022)}px "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif`
  ctx.textBaseline = 'bottom'

  // Left: domain name
  ctx.textAlign = 'left'
  ctx.fillText('www.segunbangla.com', paddingX, watermarkY)

  // Right: brand name in Bangla
  ctx.textAlign = 'right'
  ctx.fillText('সেগুন বাংলা', W - paddingX, watermarkY)

  // ─── Convert to PNG and open in new tab ─────────────────────────────────
  onProgress?.('ছবি তৈরি হচ্ছে...')

  const dataUrl = canvas.toDataURL('image/png')

  // Open in new tab with just the image
  const newWindow = window.open('', '_blank')
  if (!newWindow) {
    // Fallback: direct download
    const link = document.createElement('a')
    link.download = filename.replace('.png', '') + '.png'
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    onProgress?.('')
    return
  }

  // Create an HTML page with the image and download button
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Social Card - segunbangla.com</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: #222;
    font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif;
    padding: 20px;
  }
  .card-image {
    max-width: 100%;
    height: auto;
    box-shadow: 0 4px 30px rgba(0,0,0,0.5);
    border-radius: 4px;
  }
  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .btn {
    padding: 14px 40px;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary {
    background: #5C3317;
    color: #fff;
  }
  .btn-primary:hover {
    background: #7A4A2A;
  }
  .btn-secondary {
    background: #444;
    color: #fff;
  }
  .btn-secondary:hover {
    background: #555;
  }
  .instructions {
    margin-top: 16px;
    color: #999;
    font-size: 14px;
    text-align: center;
    max-width: 500px;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <img class="card-image" src="${dataUrl}" alt="Social Card" />
  <div class="actions">
    <a class="btn btn-primary" href="${dataUrl}" download="${filename.replace('.png', '')}.png">
      ⬇️ ছবি ডাউনলোড করুন
    </a>
    <button class="btn btn-secondary" onclick="window.print()">
      🖨️ প্রিন্ট / PDF
    </button>
  </div>
  <div class="instructions">
    অথবা ছবিতে <strong>ডান-ক্লিক করে Save Image As...</strong> নির্বাচন করুন
  </div>
</body>
</html>`

  newWindow.document.write(html)
  newWindow.document.title = `Social Card - ${data.title.substring(0, 50)}`
  newWindow.document.close()

  onProgress?.('')
}

/**
 * Load an image from URL using our own server-side proxy to avoid CORS issues.
 * The proxy fetches the image server-to-server and serves it from our domain,
 * so the canvas is never tainted.
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  // Use our own API route as a proxy
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Final fallback: try loading the original URL directly
      const img2 = new Image()
      img2.crossOrigin = 'anonymous'
      img2.onload = () => resolve(img2)
      img2.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img2.src = url
    }
    img.src = proxyUrl
  })
}
