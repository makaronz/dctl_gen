const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Professional Film Industry Color Palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // DCTL Brand Colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa', // Primary for dark mode
          500: '#3b82f6', // Primary brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd', 
          300: '#7dd3fc',
          400: '#818cf8', // Secondary for dark mode
          500: '#6366f1', // Secondary brand color
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        
        // Status Colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Success green
          600: '#059669', // Primary success
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Primary warning
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Primary error
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Neutral Professional Scale
        neutral: {
          50: '#f9fafb',  // Light backgrounds
          100: '#f3f4f6', // Card backgrounds
          200: '#e5e7eb', // Borders
          300: '#d1d5db', // Input borders
          400: '#9ca3af', // Muted text
          500: '#6b7280', // Regular text
          600: '#4b5563', // Dark text
          700: '#374151', // Darker text
          800: '#1f2937', // Dark surfaces
          900: '#111827', // Dark backgrounds
        },
        
        // Code Editor Colors (Professional)
        code: {
          bg: '#0d1117',      // Dark editor background
          surface: '#161b22',  // Editor panels
          border: '#30363d',   // Editor borders
          text: '#f0f6fc',     // Editor text
          comment: '#7d8590',  // Comments
          keyword: '#ff7b72',  // Keywords
          string: '#a5d6ff',   // Strings
          number: '#79c0ff',   // Numbers
          function: '#d2a8ff', // Functions
        },
        
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      
      // Professional Typography
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px
        'base': ['0.875rem', { lineHeight: '1.5' }],  // 14px (body)
        'lg': ['1rem', { lineHeight: '1.5' }],        // 16px
        'xl': ['1.125rem', { lineHeight: '1.4' }],    // 18px
        '2xl': ['1.5rem', { lineHeight: '1.4' }],     // 24px (H3)
        '3xl': ['1.875rem', { lineHeight: '1.3' }],   // 30px (H2)
        '4xl': ['2.25rem', { lineHeight: '1.2' }],    // 36px (H1)
        '5xl': ['3rem', { lineHeight: '1.1' }],       // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
      },
      
      // Professional Spacing Scale
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '96': '24rem',    // 384px
        '128': '32rem',   // 512px
      },
      
      // Enhanced Border Radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'xs': '0.25rem',  // 4px
        'panel': '0.5rem', // 8px - panels
        'card': '0.75rem', // 12px - cards
      },
      
      // Professional Shadows
      boxShadow: {
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 0 4px rgba(59, 130, 246, 0.1)',
      },
      
      // Animation Timing
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'professional': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Professional Animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      
      // Grid System
      gridTemplateColumns: {
        'dctl': '400px 1fr', // Left panel + right panel
        'dctl-wide': '480px 1fr', // Wide left panel
        'parameter-grid': 'repeat(auto-fit, minmax(280px, 1fr))',
      },
    },
  },
  plugins: [],
}

export default config 