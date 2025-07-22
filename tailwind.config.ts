
import type { Config } from "tailwindcss";

export default {
	important: true,
	safelist: [
		// Backgrounds
		'bg-gray-800/50',
		'bg-gray-900/60',
		'bg-emerald-600',
		'hover:bg-emerald-700',
		'hover:bg-gray-800/50',
		'bg-transparent',
		'bg-gray-900/70',
		'bg-gradient-to-r',
		'from-emerald-500',
		'to-emerald-600',
		'hover:from-emerald-400',
		'hover:to-emerald-500',
		'bg-gradient-to-br',
		'from-gray-950',
		'via-black',
		'to-gray-950',
		'bg-gray-950/80',
		'from-gray-950/80',
		'via-black/80',
		'to-gray-950/80',
		'backdrop-blur-xl',
		// Borders
		'border-emerald-500/30',
		'focus:border-emerald-400',
		'border-t',
		'border-gray-800/50',
		'border-gray-700/50',
		'border',
		'border-none',
		'border-gray-800/30',
		// Rings
		'focus:ring-emerald-400/20',
		'focus:ring-emerald-500/20',
		'focus:ring-2',
		// Text
		'text-white',
		'placeholder-gray-500',
		'placeholder-gray-400',
		'text-gray-400',
		'hover:text-white',
		'font-medium',
		'text-base',
		'text-emerald-400',
		'text-sm',
		'hover:text-emerald-400',
		// Sizes
		'h-10',
		'w-8',
		'h-8',
		'w-10',
		'pl-10',
		'pr-12',
		'min-h-[48px]',
		'max-h-32',
		'max-w-4xl',
		'w-full',
		'px-4',
		'py-3',
		'rounded-full',
		'max-h-32',
		'max-h-120',
		'min-h-48',
		'max-h-120',
		'pb-32',
		'pb-4',
		'py-4',
		'fixed',
		'min-w-0',
		// Spacing and Layout
		'p-4',
		'flex-shrink-0',
		'flex',
		'flex-col',
		'flex-1',
		'items-center',
		'space-x-3',
		'mx-auto',
		'relative',
		'rounded-xl',
		'rounded-lg',
		'p-0',
		'gap-2',
		'absolute',
		'right-3',
		'top-1/2',
		'transform',
		'-translate-y-1/2',
		'justify-center',
		'overflow-y-auto',
		'max-w-4xl',
		// Font and Effects
		'font-inter',
		'text-[15px]',
		'leading-relaxed',
		'transition-all',
		'duration-200',
		'duration-300',
		'ease-in-out',
		'right-2',
		'backdrop-blur-sm',
		'shadow-lg',
		'resize-none',
		'focus:border-emerald-500/50',
		'hover:shadow-sm',
		'disabled:bg-gray-600',
		'disabled:opacity-50',
		'variant-ghost',
		'size-icon',
		'animate-pulse',
		'animate-spin',
		'opacity-50',
		'cursor-not-allowed',
		'focus:outline-none',
		'focus:ring-emerald-500/20',
		'native-button',
		'haptic-feedback',
		'keyboard-spacer',
		'shadow-lg',
		'z-50',
	],
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
				inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { opacity: '0', transform: 'translateX(-16px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.96)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in': 'slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
