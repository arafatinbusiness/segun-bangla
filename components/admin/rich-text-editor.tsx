'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Code,
  Pilcrow,
  Minus,
  Table,
  Superscript,
  Subscript,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

type HeadingLevel = 'h1' | 'h2' | 'h3'

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'নিবন্ধের সম্পূর্ণ বিষয়বস্তু লিখুন...',
  minHeight = '500px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  // Save selection when editor has focus, so toolbar buttons can use it
  const savedSelectionRef = useRef<Range | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize editor content on mount
  useEffect(() => {
    if (!isMounted || !editorRef.current) return
    if (value) {
      editorRef.current.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Save selection whenever editor has focus
  const saveSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
  }, [])

  // Restore saved selection before any toolbar operation
  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(savedSelectionRef.current)
      }
    }
  }, [])

  // Helper: wrap selected text with a tag
  const wrapSelection = useCallback((tagName: string, attrs: Record<string, string> = {}) => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) return
    const range = sel.getRangeAt(0)
    const selectedText = range.extractContents()
    const wrapper = document.createElement(tagName)
    Object.entries(attrs).forEach(([k, v]) => wrapper.setAttribute(k, v))
    wrapper.appendChild(selectedText)
    range.insertNode(wrapper)
    // Move cursor after the wrapper
    range.setStartAfter(wrapper)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  // Helper: apply inline style to selection
  const applyInlineStyle = useCallback((styleProp: string, value: string) => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) return
    const range = sel.getRangeAt(0)
    const selectedText = range.extractContents()
    const wrapper = document.createElement('span')
    // Use !important to override Tailwind prose styles on the article detail page
    wrapper.setAttribute('style', `${styleProp === 'backgroundColor' ? 'background-color' : styleProp}: ${value} !important`)
    wrapper.appendChild(selectedText)
    range.insertNode(wrapper)
    range.setStartAfter(wrapper)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  // Helper: apply text-align to parent block
  const applyBlockAlign = useCallback((align: string) => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    
    // ১. সিলেকশনের শুরুর নোড এবং তার নিকটবর্তী ব্লক এলিমেন্ট খুঁজে বের করা
    let startNode = range.startContainer
    let block: HTMLElement | null = null

    if (startNode.nodeType === Node.TEXT_NODE) {
      block = startNode.parentNode as HTMLElement
    } else if (startNode instanceof HTMLElement) {
      block = startNode
    }

    // closest ব্লক এলিমেন্ট খোঁজা (এডিটর রুট বাদ দিয়ে)
    if (block) {
      block = block.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th')
    }

    // ২. যদি কোনো নির্দিষ্ট ব্লক এলিমেন্ট না পাওয়া যায় (যেমন একদম খালি লাইন বা রুট টেক্সট)
    if (!block || block === editorRef.current) {
      // একটি নতুন অনুচ্ছেদ (<p>) তৈরি করা
      const p = document.createElement('p')
      p.style.display = 'block'
      
      if (!range.collapsed) {
        // যদি টেক্সট সিলেক্ট করা থাকে, তবে তা কেটে নতুন <p> এর ভেতর নেওয়া
        const contents = range.extractContents()
        p.appendChild(contents)
        range.insertNode(p)
      } else {
        // যদি কোনো টেক্সট সিলেক্ট করা না থাকে (শুধু কার্সার থাকে)
        // কার্সার পজিশনের নোডটিকে খুঁজে বের করে <p> দিয়ে র‍্যাপ করা
        let targetNode: Node | null = range.startContainer
        if (targetNode === editorRef.current) {
          // রুট এডিটর হলে কার্সার ইণ্ডেক্সের চাইল্ড নোড নেওয়া
          targetNode = editorRef.current.childNodes[range.startOffset] || null
        }
        
        if (targetNode && targetNode !== editorRef.current) {
          targetNode.parentNode?.insertBefore(p, targetNode)
          p.appendChild(targetNode)
        } else {
          // একদম খালি এডিটর হলে সরাসরি <p> পুশ করে ভেতরে কার্সার প্লেস করা
          p.innerHTML = '&#8203;' // Zero-width space যাতে কার্সার লাইনে থাকে
          editorRef.current?.appendChild(p)
        }
      }
      block = p
      
      // নতুন ব্লকের ভেতরে কার্সার ফিরিয়ে আনা যেন সিলেকশন হারিয়ে না যায়
      const newRange = document.createRange()
      newRange.selectNodeContents(block)
      newRange.collapse(false)
      sel.removeAllRanges()
      sel.addRange(newRange)
      savedSelectionRef.current = newRange.cloneRange()
    }

    // ৩. ফাইনাল এলাইনমেন্ট স্টাইল অ্যাপ্লাই করা
    if (block && block instanceof HTMLElement) {
      console.log('[RichTextEditor] applyBlockAlign:', align, 'to block:', block.tagName)
      block.style.textAlign = align
      
      // এডিটর ভ্যালু স্টেট আপডেট
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    }
  }, [restoreSelection, onChange])

  // Helper: insert HTML at cursor

  const insertHTML = useCallback((html: string) => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const temp = document.createElement('div')
    temp.innerHTML = html
    const fragment = document.createDocumentFragment()
    while (temp.firstChild) {
      fragment.appendChild(temp.firstChild)
    }
    range.insertNode(fragment)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  // Bold
  const handleBold = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('বোল্ড করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    // Check if already bold
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('strong, b')
      if (existing && existing.parentNode) {
        // Unwrap
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('বোল্ড সরানো হয়েছে')
        return
      }
    }
    wrapSelection('strong')
    toast.success('বোল্ড প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Italic
  const handleItalic = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('ইটালিক করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('em, i')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('ইটালিক সরানো হয়েছে')
        return
      }
    }
    wrapSelection('em')
    toast.success('ইটালিক প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Underline
  const handleUnderline = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('আন্ডারলাইন করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('u')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('আন্ডারলাইন সরানো হয়েছে')
        return
      }
    }
    wrapSelection('u')
    toast.success('আন্ডারলাইন প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Strikethrough
  const handleStrike = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('স্ট্রাইকথ্রু করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('s, strike, del')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('স্ট্রাইকথ্রু সরানো হয়েছে')
        return
      }
    }
    wrapSelection('s')
    toast.success('স্ট্রাইকথ্রু প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Superscript
  const handleSuperscript = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('সুপারস্ক্রিপ্ট করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('sup')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('সুপারস্ক্রিপ্ট সরানো হয়েছে')
        return
      }
    }
    wrapSelection('sup')
    toast.success('সুপারস্ক্রিপ্ট প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Subscript
  const handleSubscript = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) {
      toast.error('সাবস্ক্রিপ্ট করতে আগে টেক্সট সিলেক্ট করুন')
      return
    }
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('sub')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
        toast.success('সাবস্ক্রিপ্ট সরানো হয়েছে')
        return
      }
    }
    wrapSelection('sub')
    toast.success('সাবস্ক্রিপ্ট প্রয়োগ করা হয়েছে')
  }, [wrapSelection, onChange])

  // Link
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkColor, setLinkColor] = useState('#2563eb')
  const linkInputRef = useRef<HTMLInputElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

  const handleLink = useCallback(() => {
    // Use saved selection (from onMouseUp/onKeyUp) since editor loses focus on button click
    const savedRange = savedSelectionRef.current
    if (savedRange) {
      const selectedText = savedRange.toString()
      if (selectedText) {
        savedRangeRef.current = savedRange.cloneRange()
        setLinkUrl('https://')
        setLinkColor('#2563eb')
        setShowLinkInput(true)
        setTimeout(() => linkInputRef.current?.focus(), 50)
        return
      }
    }
    // Fallback: try direct selection
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    if (selectedText) {
      if (selection && selection.rangeCount > 0) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange()
      }
      setLinkUrl('https://')
      setLinkColor('#2563eb')
      setShowLinkInput(true)
      setTimeout(() => linkInputRef.current?.focus(), 50)
    } else {
      alert('লিংক যুক্ত করতে আগে টেক্সট সিলেক্ট করুন')
    }
  }, [])

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl && savedRangeRef.current) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(savedRangeRef.current)
      }
      const attrs: Record<string, string> = {
        href: linkUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
      // Add custom color if not default blue
      if (linkColor && linkColor !== '#2563eb') {
        attrs.style = `color: ${linkColor}; text-decoration: underline;`
      }
      wrapSelection('a', attrs)
      toast.success('লিংক যুক্ত করা হয়েছে')
    }
    setShowLinkInput(false)
    setLinkUrl('')
    setLinkColor('#2563eb')
    savedRangeRef.current = null
  }, [linkUrl, linkColor, wrapSelection])

  // Image with size options
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageSize, setImageSize] = useState<'landscape' | 'portrait' | 'square' | 'full'>('landscape')
  const [imageCaption, setImageCaption] = useState('')
  const imageUrlInputRef = useRef<HTMLInputElement>(null)

  const imageSizeOptions: { value: typeof imageSize; label: string; icon: string; desc: string }[] = [
    { value: 'landscape', label: 'ল্যান্ডস্কেপ', icon: '▬', desc: '১৬:৯ - প্রশস্ত ছবির জন্য (ডিফল্ট)' },
    { value: 'portrait', label: 'পোর্ট্রেট', icon: '▯', desc: '৩:৪ - ব্যক্তি/মুখের ছবির জন্য' },
    { value: 'square', label: 'স্কয়ার', icon: '▢', desc: '১:১ - বর্গাকার ছবির জন্য' },
    { value: 'full', label: 'পূর্ণ প্রস্থ', icon: '▬', desc: '১০০% - কন্টেইনারের পূর্ণ প্রস্থ' },
  ]

  const handleImageClick = useCallback(() => {
    setImageUrl('')
    setImageSize('landscape')
    setShowImageInput(true)
    setTimeout(() => imageUrlInputRef.current?.focus(), 50)
  }, [])

  const handleImageSubmit = useCallback(() => {
    if (!imageUrl) return
    
    const sizeClasses: Record<string, string> = {
      landscape: 'rounded-lg my-4 max-w-full',
      portrait: 'rounded-lg my-4 max-w-full',
      square: 'rounded-lg my-4 max-w-full',
      full: 'rounded-lg my-4 w-full',
    }
    
    const sizeStyles: Record<string, string> = {
      landscape: 'max-width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;',
      portrait: 'max-width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;max-height:500px;',
      square: 'max-width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;max-width:400px;',
      full: 'width:100%;height:auto;',
    }
    
    const imgClass = sizeClasses[imageSize] || sizeClasses.landscape
    const imgStyle = sizeStyles[imageSize] || sizeStyles.landscape
    
    let html = `<img src="${imageUrl}" alt="ছবি" class="${imgClass}" style="${imgStyle}" data-image-size="${imageSize}" />`
    if (imageCaption.trim()) {
      html = `<figure class="my-4">${html}<figcaption class="text-xs text-center text-muted-foreground mt-1 italic">${imageCaption}</figcaption></figure>`
    }
    insertHTML(html)
    setShowImageInput(false)
    setImageUrl('')
    setImageCaption('')
    toast.success('ছবি যুক্ত করা হয়েছে')
  }, [imageUrl, imageSize, imageCaption, insertHTML])

  // Table
  const handleTable = useCallback(() => {
    const rows = prompt('সারির সংখ্যা:', '3')
    const cols = prompt('কলামের সংখ্যা:', '3')
    if (rows && cols) {
      let tableHTML = '<table class="w-full border-collapse my-4"><tbody>'
      for (let r = 0; r < parseInt(rows); r++) {
        tableHTML += '<tr>'
        for (let c = 0; c < parseInt(cols); c++) {
          tableHTML += `<td class="border border-border p-2">${r === 0 ? 'শিরোনাম' : 'সেল'}</td>`
        }
        tableHTML += '</tr>'
      }
      tableHTML += '</tbody></table>'
      insertHTML(tableHTML)
    }
  }, [insertHTML])

  // Heading
  const handleHeading = useCallback((level: HeadingLevel) => {
    const sel = window.getSelection()
    const selectedText = sel?.toString() || ''
    const sizes: Record<HeadingLevel, string> = {
      h1: 'text-3xl',
      h2: 'text-2xl',
      h3: 'text-xl',
    }
    const size = sizes[level]
    if (selectedText) {
      insertHTML(`<${level} class="${size} font-bold my-4">${selectedText}</${level}>`)
    } else {
      insertHTML(`<${level} class="${size} font-bold my-4">শিরোনাম</${level}>`)
    }
  }, [insertHTML])

  // Horizontal rule
  const handleHorizontalRule = useCallback(() => {
    insertHTML('<hr class="my-6 border-border" />')
  }, [insertHTML])

  // Code block
  const handleCodeBlock = useCallback(() => {
    const sel = window.getSelection()
    const selectedText = sel?.toString() || ''
    if (selectedText) {
      insertHTML(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>${selectedText}</code></pre>`)
    } else {
      insertHTML(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>কোড</code></pre>`)
    }
  }, [insertHTML])

  // Clear formatting
  const handleClearFormatting = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !sel.toString()) return
    const range = sel.getRangeAt(0)
    const selectedText = range.extractContents()
    // Strip all HTML tags
    const text = selectedText.textContent || ''
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)
    range.setStartAfter(textNode)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  // Remove extra spaces from entire content
  const handleRemoveExtraSpaces = useCallback(() => {
    if (!editorRef.current) return
    
    // Walk through all text nodes in the editor and normalize whitespace
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    const textNodes: Text[] = []
    let node: Text | null = walker.nextNode() as Text | null
    while (node) {
      textNodes.push(node)
      node = walker.nextNode() as Text | null
    }
    
    // Process each text node
    textNodes.forEach(textNode => {
      let text = textNode.textContent || ''
      
      // 1. Replace &nbsp; with regular space
      text = text.replace(/\u00A0/g, ' ')
      
      // 2. Replace zero-width spaces
      text = text.replace(/\u200B/g, '')
      text = text.replace(/\uFEFF/g, '')
      
      // 3. Replace 2+ consecutive spaces with 1 space
      text = text.replace(/ {2,}/g, ' ')
      
      // 4. Trim leading/trailing whitespace ONLY if the text node
      //    contains actual content (not just whitespace between inline elements)
      if (text.trim().length > 0) {
        text = text.replace(/^\s+/, '')
        text = text.replace(/\s+$/, '')
      }
      // If the text node is ONLY whitespace (e.g., a space between <span> tags),
      // preserve it as a single space so words don't get concatenated
      else if (text.length > 0) {
        text = ' '
      }
      
      textNode.textContent = text
    })
    
    // Remove empty paragraphs (no content or only <br>)
    const emptyParagraphs = editorRef.current.querySelectorAll('p:empty, p:only-child:has(br):not(:has(*))')
    emptyParagraphs.forEach(p => p.remove())
    
    // Also remove <p> that contain only <br>
    const brOnlyParagraphs = editorRef.current.querySelectorAll('p')
    brOnlyParagraphs.forEach(p => {
      if (p.children.length === 1 && p.children[0].tagName === 'BR' && !p.textContent?.trim()) {
        p.remove()
      }
    })
    
    // Remove empty divs
    const emptyDivs = editorRef.current.querySelectorAll('div:empty')
    emptyDivs.forEach(d => d.remove())
    
    // Update editor state
    onChange(editorRef.current.innerHTML)
    toast.success('অতিরিক্ত স্পেস সরানো হয়েছে')
  }, [onChange])

  // Color
  const colorInputRef = useRef<HTMLInputElement>(null)
  const highlightInputRef = useRef<HTMLInputElement>(null)
  const hasSelectionRef = useRef(false)

  // Track if text is selected when user clicks the color/highlight icon
  const checkSelectionBeforeColorPick = useCallback(() => {
    // Check the saved selection (from onMouseUp/onKeyUp)
    if (savedSelectionRef.current) {
      hasSelectionRef.current = savedSelectionRef.current.toString().length > 0
    } else {
      // Fallback: check current selection
      const sel = window.getSelection()
      hasSelectionRef.current = !!(sel && sel.rangeCount > 0 && sel.toString())
    }
    if (!hasSelectionRef.current) {
      toast.error('রঙ প্রয়োগ করতে আগে টেক্সট সিলেক্ট করুন')
    }
  }, [])

  const handleColor = useCallback((color: string) => {
    if (!color || !hasSelectionRef.current) return
    restoreSelection()
    applyInlineStyle('color', color)
    hasSelectionRef.current = false
  }, [applyInlineStyle])

  const handleHighlight = useCallback((color: string) => {
    if (!color || !hasSelectionRef.current) return
    restoreSelection()
    applyInlineStyle('backgroundColor', color)
    hasSelectionRef.current = false
  }, [applyInlineStyle])

  // Alignment
  const handleAlign = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    applyBlockAlign(align)
    const labels: Record<string, string> = {
      left: 'বামে সারিবদ্ধ করা হয়েছে',
      center: 'মাঝে সারিবদ্ধ করা হয়েছে',
      right: 'ডানে সারিবদ্ধ করা হয়েছে',
      justify: 'জাস্টিফাইড করা হয়েছে',
    }
    toast.success(labels[align] || 'সারিবদ্ধ করা হয়েছে')
  }, [applyBlockAlign])

  // Lists
  const handleUnorderedList = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existingList = node.closest('ul')
      if (existingList) {
        // Unwrap list items
        const parent = existingList.parentNode
        if (parent) {
          while (existingList.firstChild) {
            const li = existingList.firstChild as HTMLElement
            const p = document.createElement('p')
            p.innerHTML = li.innerHTML
            parent.insertBefore(p, existingList)
          }
          parent.removeChild(existingList)
        }
      } else {
        // Find the block element (p, div, heading, etc.)
        const block = node.closest('p, div, h1, h2, h3, h4, h5, h6, li') || node
        const html = block.innerHTML
        const ul = document.createElement('ul')
        ul.className = 'list-disc pl-6 my-2'
        
        // If there's selected text, use it; otherwise use the block content
        const selectedText = sel.toString()
        if (selectedText) {
          // Split selected text by lines or <br>
          const lines = selectedText.split('\n').filter(l => l.trim())
          lines.forEach((line) => {
            const li = document.createElement('li')
            li.innerHTML = line.trim()
            ul.appendChild(li)
          })
        } else {
          // No selection - convert the entire block to a list
          // Split by <br> tags
          const lines = html.split(/<br\s*\/?>/i).filter(l => l.trim())
          if (lines.length > 0) {
            lines.forEach((line) => {
              const li = document.createElement('li')
              li.innerHTML = line.trim()
              ul.appendChild(li)
            })
          } else {
            // Single line - just wrap it
            const li = document.createElement('li')
            li.innerHTML = html
            ul.appendChild(li)
          }
        }
        block.innerHTML = ''
        block.appendChild(ul)
      }
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleOrderedList = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existingList = node.closest('ol')
      if (existingList) {
        const parent = existingList.parentNode
        if (parent) {
          while (existingList.firstChild) {
            const li = existingList.firstChild as HTMLElement
            const p = document.createElement('p')
            p.innerHTML = li.innerHTML
            parent.insertBefore(p, existingList)
          }
          parent.removeChild(existingList)
        }
      } else {
        const block = node.closest('p, div, h1, h2, h3, h4, h5, h6, li') || node
        const html = block.innerHTML
        const ol = document.createElement('ol')
        ol.className = 'list-decimal pl-6 my-2'
        
        const selectedText = sel.toString()
        if (selectedText) {
          const lines = selectedText.split('\n').filter(l => l.trim())
          lines.forEach((line) => {
            const li = document.createElement('li')
            li.innerHTML = line.trim()
            ol.appendChild(li)
          })
        } else {
          const lines = html.split(/<br\s*\/?>/i).filter(l => l.trim())
          if (lines.length > 0) {
            lines.forEach((line) => {
              const li = document.createElement('li')
              li.innerHTML = line.trim()
              ol.appendChild(li)
            })
          } else {
            const li = document.createElement('li')
            li.innerHTML = html
            ol.appendChild(li)
          }
        }
        block.innerHTML = ''
        block.appendChild(ol)
      }
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Blockquote
  const handleBlockquote = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const existing = node.closest('blockquote')
      if (existing && existing.parentNode) {
        const parent = existing.parentNode
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
        parent.removeChild(existing)
      } else {
        const block = node.closest('p, div') || node
        const bq = document.createElement('blockquote')
        bq.className = 'border-l-4 border-primary/30 pl-4 my-4 italic'
        bq.innerHTML = block.innerHTML
        block.innerHTML = ''
        block.appendChild(bq)
      }
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Indent/Outdent
  const handleIndent = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const block = (node.closest('p, div, li') || node) as HTMLElement
      block.style.marginLeft = `${(parseInt(block.style.marginLeft) || 0) + 20}px`
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleOutdent = useCallback(() => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.startContainer
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (node && node instanceof HTMLElement) {
      const block = (node.closest('p, div, li') || node) as HTMLElement
      const current = parseInt(block.style.marginLeft) || 0
      block.style.marginLeft = `${Math.max(0, current - 20)}px`
      if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Undo/Redo using history
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(html)
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    if (editorRef.current && history[newIndex]) {
      editorRef.current.innerHTML = history[newIndex]
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    if (editorRef.current && history[newIndex]) {
      editorRef.current.innerHTML = history[newIndex]
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  // Save to history on input
  const handleInputWithHistory = useCallback(() => {
    handleInput()
    saveToHistory()
  }, [handleInput, saveToHistory])

  // Toolbar button component
  const ToolBtn = ({ onClick, children, title, active }: { onClick: () => void; children: React.ReactNode; title: string; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted text-foreground transition-colors ${
        active ? 'bg-muted text-primary ring-1 ring-primary/30' : ''
      }`}
    >
      {children}
    </button>
  )

  // Toolbar divider
  const Divider = () => <span className="w-px h-6 bg-border mx-0.5 shrink-0" />

  if (!isMounted) {
    return (
      <div
        className="w-full border rounded-lg bg-card"
        style={{ minHeight }}
      >
        <div className="p-4 text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    )
  }

  return (
    <div className="w-full border rounded-lg bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-muted/30 border-b border-border sticky top-0 z-10">
        {/* Undo/Redo */}
        <ToolBtn onClick={handleUndo} title="পূর্বাবস্থা (Undo)">
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleRedo} title="পুনরায় (Redo)">
          <Redo className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Text Formatting */}
        <ToolBtn onClick={handleBold} title="বোল্ড (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleItalic} title="ইটালিক (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleUnderline} title="আন্ডারলাইন (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleStrike} title="স্ট্রাইকথ্রু">
          <Strikethrough className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleSuperscript} title="সুপারস্ক্রিপ্ট">
          <Superscript className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleSubscript} title="সাবস্ক্রিপ্ট">
          <Subscript className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => handleHeading('h1')} title="শিরোনাম ১">
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => handleHeading('h2')} title="শিরোনাম ২">
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => handleHeading('h3')} title="শিরোনাম ৩">
          <Heading3 className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn onClick={handleUnorderedList} title="বুলেট লিস্ট">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleOrderedList} title="নম্বর লিস্ট">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => handleAlign('left')} title="বামে সারিবদ্ধ">
          <AlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => handleAlign('center')} title="মাঝে সারিবদ্ধ">
          <AlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => handleAlign('right')} title="ডানে সারিবদ্ধ">
          <AlignRight className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => handleAlign('justify')} title="জাস্টিফাইড">
          <AlignJustify className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Indent */}
        <ToolBtn onClick={handleOutdent} title="ইন্ডেন্ট কমাও">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 8 3 12 7 16" />
            <line x1="21" y1="12" x2="11" y2="12" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={handleIndent} title="ইন্ডেন্ট বাড়াও">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 8 21 12 17 16" />
            <line x1="3" y1="12" x2="13" y2="12" />
          </svg>
        </ToolBtn>
        <Divider />

        {/* Insert */}
        <ToolBtn onClick={handleLink} title="লিংক যোগ করুন">
          <Link className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleImageClick} title="ছবি যোগ করুন">
          <Image className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleTable} title="টেবিল যোগ করুন">
          <Table className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleBlockquote} title="উক্তি (Blockquote)">
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleCodeBlock} title="কোড ব্লক">
          <Code className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleHorizontalRule} title="বিভাজক রেখা">
          <Minus className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Extra */}
        <ToolBtn onClick={handleClearFormatting} title="ফরম্যাটিং মুছুন">
          <Pilcrow className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleRemoveExtraSpaces} title="অতিরিক্ত স্পেস সরান">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18" />
            <path d="M3 6h12" />
            <path d="M3 18h6" />
            <path d="M17 18l3-3 3 3" />
            <path d="M20 15v6" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => { checkSelectionBeforeColorPick(); colorInputRef.current?.click(); }} title="টেক্সট রঙ">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </ToolBtn>
        <input
          ref={colorInputRef}
          type="color"
          onChange={(e) => handleColor(e.target.value)}
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
        <ToolBtn onClick={() => { checkSelectionBeforeColorPick(); highlightInputRef.current?.click(); }} title="হাইলাইট">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4l-3-3-10 10z" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7" />
          </svg>
        </ToolBtn>
        <input
          ref={highlightInputRef}
          type="color"
          onChange={(e) => handleHighlight(e.target.value)}
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>

      {/* Link Input Popup */}
      {showLinkInput && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <span className="text-xs text-muted-foreground whitespace-nowrap">লিংক URL:</span>
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLinkSubmit()
              if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') }
            }}
            placeholder="https://example.com"
            className="flex-1 min-w-[180px] px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted-foreground">রঙ:</label>
            <input
              type="color"
              value={linkColor}
              onChange={(e) => setLinkColor(e.target.value)}
              className="w-7 h-7 p-0.5 rounded cursor-pointer border bg-background"
              title="লিংকের রঙ নির্বাচন করুন"
            />
          </div>
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="px-3 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            যোগ করুন
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl('') }}
            className="px-2 py-1 text-xs rounded text-muted-foreground hover:text-foreground"
          >
            বাতিল
          </button>
        </div>
      )}

      {/* Image Input Popup */}
      {showImageInput && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <span className="text-xs text-muted-foreground whitespace-nowrap">ছবির URL:</span>
          <input
            ref={imageUrlInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleImageSubmit()
              if (e.key === 'Escape') { setShowImageInput(false); setImageUrl(''); setImageCaption('') }
            }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 min-w-[180px] px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">সাইজ:</span>
            <div className="flex gap-1">
              {imageSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setImageSize(opt.value)}
                  title={opt.desc}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    imageSize === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">ক্যাপশন:</span>
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleImageSubmit()
                if (e.key === 'Escape') { setShowImageInput(false); setImageUrl(''); setImageCaption('') }
              }}
              placeholder="ছবির নিচে ক্যাপশন (ঐচ্ছিক)"
              className="w-[200px] px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleImageSubmit}
            className="px-3 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            যোগ করুন
          </button>
          <button
            type="button"
            onClick={() => { setShowImageInput(false); setImageUrl(''); setImageCaption('') }}
            className="px-2 py-1 text-xs rounded text-muted-foreground hover:text-foreground"
          >
            বাতিল
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInputWithHistory}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={saveSelection}
        className="p-6 overflow-y-auto focus:outline-none text-foreground leading-relaxed rich-text-editor-content"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* Styles to make links visible and ensure proper block display inside the editor */}
      <style jsx global>{`
        .rich-text-editor-content a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }
        .rich-text-editor-content a:hover {
          color: #1d4ed8 !important;
        }
        .rich-text-editor-content p {
          display: block;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  )
}
