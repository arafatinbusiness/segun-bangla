'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
  Undo,
  Redo,
  Code,
  Eye,
  Edit3,
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
  const [isPreview, setIsPreview] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize editor content
  useEffect(() => {
    if (!isMounted || !editorRef.current) return
    if (!editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value
    }
  }, [isMounted, value])

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    // Trigger onChange after command
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    }, 0)
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleLink = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    const url = prompt('URL লিখুন:', 'https://')
    if (url) {
      if (selectedText) {
        execCommand('createLink', url)
      } else {
        execCommand('insertHTML', `<a href="${url}" target="_blank">${url}</a>`)
      }
    }
  }, [execCommand])

  const handleImage = useCallback(() => {
    const url = prompt('ছবির URL লিখুন:', 'https://')
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="ছবি" class="rounded-lg my-4 max-w-full" style="max-width:100%;height:auto;" />`)
    }
  }, [execCommand])

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
      execCommand('insertHTML', tableHTML)
    }
  }, [execCommand])

  const handleHeading = useCallback((level: HeadingLevel) => {
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    if (selectedText) {
      execCommand('insertHTML', `<${level} class="text-2xl font-bold my-4">${selectedText}</${level}>`)
    } else {
      execCommand('insertHTML', `<${level} class="text-2xl font-bold my-4">শিরোনাম</${level}>`)
    }
  }, [execCommand])

  const handleHorizontalRule = useCallback(() => {
    execCommand('insertHTML', '<hr class="my-6 border-border" />')
  }, [execCommand])

  const handleCodeBlock = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''
    if (selectedText) {
      execCommand('insertHTML', `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>${selectedText}</code></pre>`)
    } else {
      execCommand('insertHTML', `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>কোড</code></pre>`)
    }
  }, [execCommand])

  const handleClearFormatting = useCallback(() => {
    execCommand('removeFormat')
  }, [execCommand])

  const handleColor = useCallback(() => {
    const color = prompt('রঙের কোড লিখুন (যেমন: #ff0000):', '#ff0000')
    if (color) execCommand('foreColor', color)
  }, [execCommand])

  const handleHighlight = useCallback(() => {
    const color = prompt('হাইলাইট রঙের কোড লিখুন (যেমন: #ffff00):', '#ffff00')
    if (color) execCommand('hiliteColor', color)
  }, [execCommand])

  const handleFontSize = useCallback(() => {
    const size = prompt('ফন্ট সাইজ (1-7):', '3')
    if (size) execCommand('fontSize', size)
  }, [execCommand])

  const handleIndent = useCallback(() => {
    execCommand('indent')
  }, [execCommand])

  const handleOutdent = useCallback(() => {
    execCommand('outdent')
  }, [execCommand])

  const handleAlign = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`)
  }, [execCommand])

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
        <ToolBtn onClick={() => execCommand('undo')} title="পূর্বাবস্থা (Undo)">
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('redo')} title="পুনরায় (Redo)">
          <Redo className="w-4 h-4" />
        </ToolBtn>
        <Divider />

        {/* Text Formatting */}
        <ToolBtn onClick={() => execCommand('bold')} title="বোল্ড (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('italic')} title="ইটালিক (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('underline')} title="আন্ডারলাইন (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('strikeThrough')} title="স্ট্রাইকথ্রু">
          <Strikethrough className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('superscript')} title="সুপারস্ক্রিপ্ট">
          <Superscript className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('subscript')} title="সাবস্ক্রিপ্ট">
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
        <ToolBtn onClick={() => execCommand('insertUnorderedList')} title="বুলেট লিস্ট">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('insertOrderedList')} title="নম্বর লিস্ট">
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
        <ToolBtn onClick={handleImage} title="ছবি যোগ করুন">
          <Image className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={handleTable} title="টেবিল যোগ করুন">
          <Table className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => execCommand('blockquote')} title="উক্তি (Blockquote)">
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
        <ToolBtn onClick={handleColor} title="টেক্সট রঙ">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={handleHighlight} title="হাইলাইট">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4l-3-3-10 10z" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7" />
          </svg>
        </ToolBtn>
        <Divider />

        {/* Preview Toggle */}
        <ToolBtn onClick={() => setIsPreview(!isPreview)} title={isPreview ? 'সম্পাদনা' : 'প্রিভিউ'}>
          {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </ToolBtn>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="p-6 overflow-y-auto prose prose-sm max-w-none dark:prose-invert"
          style={{ minHeight }}
        >
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-muted-foreground italic">কোন বিষয়বস্তু নেই</p>
          )}
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="p-6 overflow-y-auto focus:outline-none text-foreground leading-relaxed"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  )
}
