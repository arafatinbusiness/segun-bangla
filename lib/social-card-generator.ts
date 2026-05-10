/**
 * Social Card Generator
 * Generates a downloadable photo card for social media sharing.
 * Opens the card in a new browser tab for the user to right-click save.
 * This avoids all canvas taint / CORS issues.
 *
 * Solid Footer Block Layout (High-Authority News Look):
 *   1. Top Branding Bar (7% height) - White bg, brand name left, date right
 *   2. Main News Image (58% height) - Clear, sharp, no overlays
 *   3. Solid Maroon Footer (35% height) - Deep maroon bg, centered title, CTA
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

  // ─── Layout Proportions ────────────────────────────────────────────────
  const headerHeightPct = 7    // Top branding bar
  const imageHeightPct = 58    // Main news image
  const footerHeightPct = 35   // Solid maroon footer

  // ─── Font Sizes (proportional to card height) ──────────────────────────
  const brandFontSize = Math.round(H * 0.028)
  const dateFontSize = Math.round(H * 0.022)
  const titleFontSize = data.title.length > 80
    ? Math.round(H * 0.045)
    : data.title.length > 50
      ? Math.round(H * 0.052)
      : Math.round(H * 0.058)
  const ctaFontSize = Math.round(H * 0.024)

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
    font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Arial Unicod MS', Arial, sans-serif;
    padding: 20px;
  }
  .card {
    width: ${W}px;
    height: ${H}px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #FFFFFF;
    box-shadow: 0 4px 30px rgba(0,0,0,0.5);
    max-width: 100%;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     1. TOP BRANDING BAR - White bg, brand left, date right
     ═══════════════════════════════════════════════════════════════════════ */
  .branding-bar {
    height: ${headerHeightPct}%;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${Math.round(W * 0.05)}px;
    flex-shrink: 0;
  }
  .brand-name {
    font-size: ${brandFontSize}px;
    font-weight: bold;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: -0.5px;
  }
  .brand-date {
    font-size: ${dateFontSize}px;
    color: #555555;
    font-weight: 400;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     2. MAIN NEWS IMAGE - Clear, sharp, no overlays
     ═══════════════════════════════════════════════════════════════════════ */
  .image-section {
    height: ${imageHeightPct}%;
    width: 100%;
    overflow: hidden;
    flex-shrink: 0;
  }
  .news-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f0f0 0%, #ddd 100%);
    color: #999;
    font-size: ${Math.round(W * 0.04)}px;
    font-weight: bold;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     3. SOLID MAROON FOOTER - Deep maroon, centered title, CTA
     ═══════════════════════════════════════════════════════════════════════ */
  .authority-footer {
    height: ${footerHeightPct}%;
    width: 100%;
    background: #800000;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${Math.round(H * 0.04)}px ${Math.round(W * 0.05)}px;
    flex-shrink: 0;
  }
  .title-area {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .title-area h1 {
    color: #FFFFFF;
    font-size: ${titleFontSize}px;
    font-weight: bold;
    text-align: center;
    line-height: 1.3;
    max-width: 92%;
    margin: 0 auto;
    word-wrap: break-word;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .cta-area {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cta-wrapper {
    display: flex;
    align-items: center;
    gap: ${Math.round(W * 0.012)}px;
    color: rgba(255,255,255,0.9);
    font-size: ${ctaFontSize}px;
    border-bottom: 2px solid rgba(255,255,255,0.4);
    padding-bottom: ${Math.round(H * 0.008)}px;
  }
  .cta-wrapper .guillemet {
    font-weight: bold;
  }
  .cta-wrapper .cta-text {
    font-weight: 300;
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
  .download-btn {
    margin-top: 16px;
    padding: 14px 40px;
    background: #800000;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif;
  }
  .download-btn:hover {
    background: #a00000;
  }
  .download-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .download-btn .spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
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
<div id="card-container" class="card">
  <!-- 1. Top Branding Bar -->
  <div class="branding-bar">
    <span class="brand-name">Segun Bangla</span>
    <span class="brand-date">${data.date}</span>
  </div>

  <!-- 2. Main News Image -->
  <div class="image-section">
    ${data.imageUrl
      ? `<img class="news-image" src="${data.imageUrl}" alt="" />`
      : `<div class="image-placeholder">সেগুন বাংলা</div>`
    }
  </div>

  <!-- 3. Solid Maroon Footer -->
  <div class="authority-footer">
    <div class="title-area">
      <h1>${data.title}</h1>
    </div>
    <div class="cta-area">
      <div class="cta-wrapper">
        <span class="guillemet">«</span>
        <span class="cta-text">বিস্তারিত কমেন্টে</span>
        <span class="guillemet">»</span>
      </div>
    </div>
  </div>
</div>
<button id="downloadBtn" class="download-btn" onclick="downloadCard()">
  ⬇️ ছবি ডাউনলোড করুন
</button>
<div class="instructions">
  অথবা ছবিতে <strong>ডান-ক্লিক করে Save Image As...</strong> নির্বাচন করুন
</div>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script>
  function downloadCard() {
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> ডাউনলোড হচ্ছে...';

    const card = document.getElementById('card-container');
    const W = ${W};
    const H = ${H};

    // Use html2canvas to capture the card as an image
    html2canvas(card, {
      width: W,
      height: H,
      scale: 1,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
    }).then(function(canvas) {
      // Convert to PNG and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = '${filename.replace('.png', '')}.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      btn.disabled = false;
      btn.innerHTML = '⬇️ ছবি ডাউনলোড করুন';
    }).catch(function(err) {
      console.error('Download failed:', err);
      btn.disabled = false;
      btn.innerHTML = '⬇️ ছবি ডাউনলোড করুন';
      alert('ডাউনলোড ব্যর্থ হয়েছে। দয়া করে ডান-ক্লিক করে Save Image As... ব্যবহার করুন।');
    });
  }
</script>
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
