import React, { useState, useCallback, useRef, useEffect } from 'react'

export interface SliderWidgetProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  precision?: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
  showSteps?: boolean
  gradient?: boolean
  realTimePreview?: boolean
}

const SliderWidget: React.FC<SliderWidgetProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  precision = 1,
  onChange,
  className = '',
  disabled = false,
  showSteps = false,
  gradient = true,
  realTimePreview = true
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  const [isHovered, setIsHovered] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100

  // Format display value
  const formatValue = useCallback((val: number) => {
    return `${val.toFixed(precision)}${unit}`
  }, [precision, unit])

  // Handle slider interaction
  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || disabled) return

    const rect = sliderRef.current.getBoundingClientRect()
    const newPercentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const newValue = min + (newPercentage / 100) * (max - min)
    
    // Snap to step
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))
    
    if (realTimePreview) {
      setDisplayValue(clampedValue)
    }
    
    onChange(clampedValue)
  }, [min, max, step, disabled, realTimePreview, onChange])

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.clientX)
    e.preventDefault()
  }, [disabled, updateValue])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateValue(e.clientX)
    }
  }, [isDragging, updateValue])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (realTimePreview) {
      setDisplayValue(value)
    }
  }, [realTimePreview, value])

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.touches[0].clientX)
    e.preventDefault()
  }, [disabled, updateValue])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      updateValue(e.touches[0].clientX)
    }
  }, [isDragging, updateValue])

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  // Update display value when prop changes
  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  // Generate step markers
  const stepMarkers = showSteps ? Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  ) : []

  return (
    <div className={`parameter-widget ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="parameter-label font-medium text-foreground">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span 
            className={`parameter-value text-sm font-mono transition-all duration-200 ${
              isDragging || isHovered ? 'text-primary scale-110' : 'text-muted-foreground'
            }`}
          >
            {formatValue(realTimePreview ? displayValue : value)}
          </span>
          {isDragging && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>

      {/* Slider Container */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track */}
        <div 
          ref={sliderRef}
          className={`slider-track cursor-pointer transition-all duration-200 ${
            isHovered ? 'h-3' : 'h-2'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Background Track */}
          <div className="absolute inset-0 bg-secondary/20 rounded-full overflow-hidden">
            {gradient && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            )}
          </div>
          
          {/* Fill Track */}
          <div 
            className={`slider-fill ${
              gradient 
                ? 'bg-gradient-to-r from-primary via-secondary to-primary' 
                : 'bg-primary'
            } transition-all duration-200 ${
              isDragging ? 'shadow-glow' : ''
            }`}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Step Markers */}
          {showSteps && (
            <div className="absolute inset-0">
              {stepMarkers.map((stepValue, index) => {
                const stepPercentage = ((stepValue - min) / (max - min)) * 100
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white/60 rounded-full"
                    style={{ left: `${stepPercentage}%` }}
                  />
                )
              })}
            </div>
          )}
        </div>
        
        {/* Thumb */}
        <div 
          ref={thumbRef}
          className={`slider-thumb ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} ${
            isDragging ? 'cursor-grabbing scale-125 shadow-glow' : ''
          } ${isHovered ? 'scale-110' : ''}`}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Thumb Ring */}
          <div className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
            isDragging ? 'border-primary/50' : 'border-transparent'
          }`} />
          
          {/* Pulse Effect */}
          {isDragging && (
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          )}
        </div>
        
        {/* Value Tooltip */}
        {(isDragging || isHovered) && (
          <div 
            className="absolute -top-10 bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 transition-all duration-200"
            style={{ 
              left: `${percentage}%`, 
              transform: 'translateX(-50%)',
              opacity: isDragging || isHovered ? 1 : 0
            }}
          >
            {formatValue(realTimePreview ? displayValue : value)}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
          </div>
        )}
      </div>
      
      {/* Range Labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
      
      {/* Professional Enhancement - Real-time DCTL Preview */}
      {realTimePreview && isDragging && (
        <div className="mt-3 p-2 bg-code-bg border border-code-border rounded text-xs">
          <span className="text-code-comment">// Real-time DCTL value:</span>
          <br />
          <span className="text-code-keyword">float</span>{' '}
          <span className="text-code-text">{label.toLowerCase().replace(/\s+/g, '_')}</span>{' '}
          <span className="text-code-text">=</span>{' '}
          <span className="text-code-number">{formatValue(displayValue)}</span>
          <span className="text-code-text">;</span>
        </div>
      )}
    </div>
  )
}

export default SliderWidget 