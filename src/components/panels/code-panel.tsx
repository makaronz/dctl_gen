import React, { useState, useEffect, useRef } from 'react'

export interface CodePanelProps {
  title?: string
  code: string
  language?: 'dctl' | 'javascript' | 'python' | 'hlsl' | 'glsl'
  readOnly?: boolean
  showLineNumbers?: boolean
  copyable?: boolean
  className?: string
  onCodeChange?: (code: string) => void
  realTimeUpdate?: boolean
  theme?: 'dark' | 'professional'
}

// Simple syntax highlighting for DCTL
const highlightDCTL = (code: string): string => {
  return code
    // Keywords
    .replace(/\b(DEVICE|__DEVICE__|float|float3|float4|int|bool|if|else|for|while|return|const)\b/g, 
      '<span class="text-code-keyword">$1</span>')
    // Numbers  
    .replace(/\b(\d+\.?\d*f?)\b/g, '<span class="text-code-number">$1</span>')
    // Strings
    .replace(/"([^"]*)"/g, '<span class="text-code-string">"$1"</span>')
    // Comments
    .replace(/\/\/.*$/gm, '<span class="text-code-comment">$&</span>')
    .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-code-comment">$&</span>')
    // Functions
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-code-function">$1</span>(')
}

const CodePanel: React.FC<CodePanelProps> = ({
  title = 'DCTL Code',
  code,
  language = 'dctl',
  readOnly = false,
  showLineNumbers = true,
  copyable = true,
  className = '',
  onCodeChange,
  realTimeUpdate = true,
  theme = 'professional'
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [localCode, setLocalCode] = useState(code)
  const [isExpanded, setIsExpanded] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  // Update local code when prop changes
  useEffect(() => {
    setLocalCode(code)
  }, [code])

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle code change
  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode)
    if (realTimeUpdate && onCodeChange) {
      onCodeChange(newCode)
    }
  }

  // Handle blur for non-real-time updates
  const handleBlur = () => {
    if (!realTimeUpdate && onCodeChange && localCode !== code) {
      onCodeChange(localCode)
    }
  }

  // Sync scroll between textarea and highlighted pre
  const handleScroll = () => {
    if (textAreaRef.current && preRef.current) {
      preRef.current.scrollTop = textAreaRef.current.scrollTop
      preRef.current.scrollLeft = textAreaRef.current.scrollLeft
    }
  }

  // Get line count
  const lineCount = localCode.split('\n').length
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1)

  // Get highlighted code
  const highlightedCode = language === 'dctl' ? highlightDCTL(localCode) : localCode

  return (
    <div 
      className={`code-panel transition-all duration-300 ${
        isExpanded ? 'scale-[1.02]' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="code-header">
        <div className="flex items-center gap-3">
          {/* Traffic Light Dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
            <div 
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            />
          </div>
          
          {/* Title */}
          <h3 className="text-neutral-100 font-medium text-sm">{title}</h3>
          
          {/* Language Badge */}
          <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded uppercase font-mono">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Line Count */}
          <span className="text-neutral-400 text-xs font-mono">
            {lineCount} lines
          </span>
          
          {/* Copy Button */}
          {copyable && (
            <button
              onClick={handleCopy}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                isCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {isCopied ? (
                <span className="flex items-center gap-1">
                  ✓ Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  📋 Copy
                </span>
              )}
            </button>
          )}
          
          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors flex items-center justify-center"
          >
            {isExpanded ? '⤓' : '⤢'}
          </button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className={`code-content relative transition-all duration-300 ${
        isExpanded ? 'max-h-96' : 'max-h-64'
      } overflow-hidden`}>
        <div className="relative h-full">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-neutral-800 border-r border-neutral-700 overflow-hidden">
              <div className="py-4 px-2 text-neutral-500 text-xs font-mono leading-6">
                {lines.map(line => (
                  <div key={line} className="h-6 flex items-center justify-end">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Code Area */}
          <div className={`relative h-full ${showLineNumbers ? 'ml-12' : ''}`}>
            {/* Highlighted Code Background */}
            <pre
              ref={preRef}
              className="absolute inset-0 p-4 font-mono text-sm text-neutral-100 overflow-auto bg-transparent pointer-events-none whitespace-pre leading-6"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            
            {/* Input Textarea */}
            {!readOnly ? (
              <textarea
                ref={textAreaRef}
                value={localCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={handleBlur}
                onScroll={handleScroll}
                className="absolute inset-0 p-4 font-mono text-sm bg-transparent text-transparent caret-white resize-none outline-none border-none overflow-auto leading-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4b5563 #1f2937'
                }}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
              />
            ) : (
              <div className="absolute inset-0 p-4 font-mono text-sm text-neutral-100 overflow-auto leading-6 whitespace-pre">
                {localCode}
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Effects */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded" />
            
            {/* Corner indicators */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-secondary/60 rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Professional Footer */}
      <div className="px-4 py-2 bg-neutral-800 border-t border-neutral-700 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>•</span>
          <span>LF</span>
          <span>•</span>
          <span className="font-mono">{localCode.length} chars</span>
        </div>
        
        <div className="flex items-center gap-2">
          {realTimeUpdate && onCodeChange && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
          
          {!readOnly && (
            <span className="text-neutral-500">
              Press Tab for autocomplete
            </span>
          )}
        </div>
      </div>
      
      {/* Professional Enhancement - DCTL Compilation Status */}
      {language === 'dctl' && localCode.length > 0 && (
        <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-700">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-400">DCTL syntax valid</span>
            <span className="text-neutral-500 ml-auto">
              Ready for DaVinci Resolve
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodePanel 