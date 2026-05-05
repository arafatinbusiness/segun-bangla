/**
 * Social Card Generator
 * Generates a downloadable photo card for social media sharing.
 * Opens the card in a new browser tab for the user to right-click save.
 * This avoids all canvas taint / CORS issues.
 *
 * Professional News Layout (full-bleed image with overlay):
 *   1. Full-bleed background image spanning entire card
 *   2. Dark gradient overlay (transparent top → dark bottom 50%)
 *   3. Date (Centered, positioned as bridge between visual and text)
 *   4. Main Headline (Centered, bold, large, over dark overlay)
 *   5. "বিস্তারিত কমেন্টে..." (Bottom-left, Bangla)
 *   6. Footer: URL left, Brand text right
 *
 * Aspect Ratios Supported:
 *   - 'facebook'  : 1200×630  (1.91:1) - Facebook, LinkedIn, Twitter/X
 *   - 'square'    : 1080×1080 (1:1)    - Instagram Feed
 *   - 'story'     : 1080×1920 (9:16)   - Instagram Story, TikTok, Facebook Story
 */

export type SocialCardFormat = 'facebook' | 'square' | 'story'

interface CardDimensions {
  width: number
  height: number
}

const FORMAT_DIMENSIONS: Record<SocialCardFormat, CardDimensions> = {
  facebook: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
}

interface SocialCardData {
  title: string
  date: string
  imageUrl?: string
}

/**
 * Generate a social media card and open it in a new tab for saving.
 * User can right-click → Save Image As... or take a screenshot.
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

  // Larger font sizes
  const titleFontSize = data.title.length > 80 ? 28 : data.title.length > 50 ? 32 : 36

  // Date position: ~32% from top (bridge between visual and text)
  const dateTopPct = 32

  // Title position: ~48% from top (over dark overlay)
  const titleTopPct = 48

  onProgress?.('সোশ্যাল কার্ড তৈরি হচ্ছে...')

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
    justify-content: center; 
    align-items: center; 
    min-height: 100vh; 
    background: #222;
    font-family: Arial, sans-serif;
    padding: 20px;
  }
  .card {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background: #8B0000;
    box-shadow: 0 4px 30px rgba(0,0,0,0.5);
    max-width: 100%;
  }
  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.1) 0%,
      rgba(0,0,0,0.15) 25%,
      rgba(0,0,0,0.4) 45%,
      rgba(0,0,0,0.75) 60%,
      rgba(0,0,0,0.85) 75%,
      rgba(0,0,0,0.9) 100%
    );
    z-index: 1;
  }
  .date {
    position: absolute;
    top: ${dateTopPct}%;
    left: 0;
    right: 0;
    text-align: center;
    color: #e0e0e0;
    font-size: 20px;
    letter-spacing: 0.5px;
    z-index: 2;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }
  .headline {
    position: absolute;
    top: ${titleTopPct}%;
    left: 0;
    right: 0;
    text-align: center;
    padding: 0 40px;
    z-index: 2;
  }
  .headline h1 {
    color: #fff;
    font-size: ${titleFontSize}px;
    font-weight: bold;
    line-height: 1.35;
    max-width: 92%;
    margin: 0 auto;
    word-wrap: break-word;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .cta {
    position: absolute;
    bottom: 55px;
    left: 30px;
    color: #ff1a1a;
    font-size: 18px;
    font-weight: bold;
    z-index: 2;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 46px;
    background: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    z-index: 2;
  }
  .footer .url {
    color: #fff;
    font-size: 17px;
    font-weight: bold;
    letter-spacing: 0.3px;
  }
  .footer .brand {
    color: #fff;
    font-size: 19px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  .instructions {
    margin-top: 20px;
    color: #999;
    font-size: 14px;
    text-align: center;
    max-width: 500px;
    line-height: 1.6;
  }
  .instructions strong {
    color: #fff;
  }
  @media (max-width: ${W + 40}px) {
    .card {
      transform: scale(${Math.min(1, (window.innerWidth - 40) / W)});
      transform-origin: top center;
    }
  }
</style>
</head>
<body>
<div class="card">
  ${data.imageUrl ? `<img class="card-bg" src="${data.imageUrl}" alt="" />` : ''}
  <div class="gradient-overlay"></div>
  <div class="date">${data.date}</div>
  <div class="headline"><h1>${data.title}</h1></div>
  <div class="cta">বিস্তারিত কমেন্টে...</div>
  <div class="footer">
    <span class="url">www.segunbangla.com</span>
    <span class="brand">সেগুন বাংলা</span>
  </div>
</div>
<div class="instructions">
  ⬇️ <strong>ডান-ক্লিক করে Save Image As...</strong> নির্বাচন করে ছবিটি ডাউনলোড করুন<br>
  অথবা স্ক্রিনশট নিন
</div>
</body>
</html>`

  onProgress?.('প্রিভিউ খোলা হচ্ছে...')

  // Open in a new window
  const newWindow = window.open('', '_blank')
  if (!newWindow) {
    // Fallback: if popup blocked, create a blob and download as HTML
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace('.png', '.html')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return
  }

  newWindow.document.write(html)
  newWindow.document.title = `Social Card - ${data.title.substring(0, 50)}`
  newWindow.document.close()

  onProgress?.('') // Clear progress
}
