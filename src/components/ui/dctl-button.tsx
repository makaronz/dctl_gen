import React from "react"

// Utility function for class names
const cn = (...classes: (string | undefined)[]) => 
  classes.filter(Boolean).join(' ')

// Button variant styles
const getButtonClasses = (variant: string, size: string) => {
  const baseClasses = "btn-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    destructive: "btn-destructive",
    outline: "btn-outline",
    ghost: "btn-ghost",
    link: "underline-offset-4 hover:underline text-primary",
  }
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  return cn(
    baseClasses,
    variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary,
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default
  )
}

export interface DCTLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  tooltip?: string
  glowEffect?: boolean
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

const DCTLButton = React.forwardRef<HTMLButtonElement, DCTLButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'default',
      loading = false,
      icon,
      iconPosition = "left",
      tooltip,
      glowEffect = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    
    const buttonClasses = cn(
      getButtonClasses(variant, size),
      loading ? "cursor-wait" : "",
      glowEffect ? "shadow-glow hover:shadow-glow/80" : "",
      "group relative overflow-hidden",
      className
    )

    return (
      <div className="relative inline-block">
        <button
          className={buttonClasses}
          ref={ref}
          disabled={isDisabled}
          title={tooltip}
          {...props}
        >
          {/* Shimmer Effect on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Button Content */}
          <div className="relative z-10 flex items-center justify-center gap-2">
            {/* Left Icon or Loading */}
            {loading ? (
              <LoadingSpinner />
            ) : icon && iconPosition === "left" ? (
              <span className="transition-transform group-hover:scale-110 duration-200">
                {icon}
              </span>
            ) : null}
            
            {/* Text Content */}
            {children && (
              <span className="transition-all duration-200 group-hover:tracking-wide">
                {children}
              </span>
            )}
            
            {/* Right Icon */}
            {!loading && icon && iconPosition === "right" && (
              <span className="transition-transform group-hover:scale-110 duration-200">
                {icon}
              </span>
            )}
          </div>
        </button>
        
        {/* Tooltip */}
        {tooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
          </div>
        )}
      </div>
    )
  }
)

DCTLButton.displayName = "DCTLButton"

export { DCTLButton } 