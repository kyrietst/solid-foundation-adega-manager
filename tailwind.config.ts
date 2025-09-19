import type { Config } from "tailwindcss";

export default {
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
				'sf-pro-display': ['SF Pro Display', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
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
				},
				// ============================================================================
				// SISTEMA DE CORES ADEGA WINE CELLAR v2.1 - Arquitetura Completa
				// ============================================================================
				
				// Cores Primárias
				'primary-black': '#000000',
				'primary-yellow': '#FFD700',
				
				// Extended Black Scale (100-60)
				'black-100': '#000000',
				'black-90': '#1a1a1a',
				'black-80': '#333333',
				'black-70': '#4a4a4a',
				'black-60': '#666666',
				
				// Extended Yellow Scale (100-60)
				'yellow-100': '#FFD700',
				'yellow-90': '#FFC107',
				'yellow-80': '#FFB300',
				'yellow-70': '#FF8F00',
				'yellow-60': '#FF6F00',
				
				// Professional Neutrals (gray-950 to gray-50) - Tailwind compatible
				'gray-950': '#030712',
				'gray-900': '#111827',
				'gray-800': '#1f2937',
				'gray-700': '#374151',
				'gray-600': '#4b5563',
				'gray-500': '#6b7280',
				'gray-400': '#9ca3af',
				'gray-300': '#d1d5db',
				'gray-200': '#e5e7eb',
				'gray-100': '#f3f4f6',
				'gray-50': '#f9fafb',
				
				// Modern Accents
				'accent-blue': '#3b82f6',
				'accent-green': '#10b981',
				'accent-red': '#ef4444',
				'accent-purple': '#8b5cf6',
				'accent-orange': '#f97316',

				// Chart Color System - Extends accent colors for data visualization
				'chart-1': '#3b82f6', // accent-blue
				'chart-2': '#10b981', // accent-green
				'chart-3': '#f97316', // accent-orange
				'chart-4': '#8b5cf6', // accent-purple
				'chart-5': '#ef4444', // accent-red
				'chart-6': '#06b6d4', // cyan
				'chart-7': '#f59e0b', // amber
				'chart-8': '#84cc16', // lime

				// ============================================================================
				// GRADIENT SYSTEM - Standardized Gradient Colors
				// ============================================================================
				'gradient-fire': {
					'from': '#FF2400',    // Fire red start
					'via': '#FFDA04',     // Golden yellow center
					'to': '#FF2400',      // Fire red end
				},

				// ============================================================================
				// GOLDEN ACCENT SYSTEM - Standardized Golden Color Variants
				// ============================================================================
				'accent-gold': {
					'100': '#FFD700', // Primary golden color (was hardcoded #FFD700)
					'90': '#FFC700',  // Slightly darker
					'80': '#FFB700',  // Medium variant
					'70': '#FFA700',  // Darker variant
					'60': '#FF9700',  // Darkest variant
					'50': '#FF8700',  // Ultra dark
					'40': '#E6C200',  // Muted
					'30': '#D4B800',  // Very muted
					'20': '#C2A600',  // Subtle
					'10': '#B09400',  // Very subtle
					'5': '#9E8200',   // Ultra subtle
				},

				// Mantém compatibilidade com paleta anterior
				'adega': {
					'black': '#000000',
					'charcoal': '#1a1a1a',
					'graphite': '#2d2d2d',
					'slate': '#404040',
					'steel': '#595959',
					'pewter': '#737373',
					'silver': '#8c8c8c',
					'platinum': '#a6a6a6',
					'champagne': '#bfbf8c',
					'gold': '#d4af37',
					'amber': '#ffbf00',
					'yellow': '#ffd700'
				}
			},
			// ============================================================================
			// DIMENSION TOKEN SYSTEM - Standardized Sizing and Spacing
			// ============================================================================

			// Table Column Width System - Eliminates hardcoded px values
			width: {
				// Micro widths for icons/actions
				'col-xs': '80px',     // Actions, icons
				'col-sm': '100px',    // Small data (IDs, counts)
				'col-md': '120px',    // Medium data (dates, numbers)
				'col-lg': '140px',    // Standard text fields
				'col-xl': '160px',    // Long text fields
				'col-2xl': '180px',   // Extended text
				'col-3xl': '200px',   // Wide content
				'col-4xl': '220px',   // Very wide content
				'col-max': '250px',   // Maximum standard width

				// Modal width tokens - Eliminates !important overrides
				'modal-xs': '320px',    // Extra small modals
				'modal-sm': '384px',    // Small modals
				'modal-md': '448px',    // Medium modals
				'modal-lg': '512px',    // Large modals
				'modal-xl': '576px',    // Extra large modals
				'modal-2xl': '672px',   // 2x large modals
				'modal-3xl': '768px',   // 3x large modals
				'modal-4xl': '896px',   // 4x large modals
				'modal-1200': '1200px', // Inventory modals (standardized)
				'modal-1400': '1400px', // Ultra wide modals
				'modal-full': '100vw',  // Full width modals
			},

			// Viewport Height Token System - Eliminates arbitrary vh values
			height: {
				// Content area heights
				'content-xs': '40vh',   // Compact content
				'content-sm': '50vh',   // Small content areas
				'content-md': '60vh',   // Standard content height
				'content-lg': '70vh',   // Large content areas
				'content-xl': '80vh',   // Extra large content
				'content-2xl': '90vh',  // Maximum content height
				'content-full': '100vh', // Full viewport

				// Dialog specific heights
				'dialog-xs': '30vh',    // Small dialogs
				'dialog-sm': '40vh',    // Standard dialogs
				'dialog-md': '60vh',    // Medium dialogs
				'dialog-lg': '80vh',    // Large dialogs
				'dialog-xl': '90vh',    // Maximum dialog height

				// Decorative element heights
				'deco-thin': '1px',     // Ultra thin decorative lines
				'deco-line': '2px',     // Standard decorative lines
				'deco-border': '3px',   // Decorative borders
			},

			// Minimum Height System
			minHeight: {
				'content-xs': '40vh',
				'content-sm': '50vh',
				'content-md': '60vh',
				'content-lg': '70vh',
				'content-xl': '80vh',
				'content-2xl': '90vh',
			},

			// Maximum Height System
			maxHeight: {
				'content-xs': '40vh',
				'content-sm': '50vh',
				'content-md': '60vh',
				'content-lg': '70vh',
				'content-xl': '80vh',
				'content-2xl': '90vh',
				'dialog-xs': '30vh',
				'dialog-sm': '40vh',
				'dialog-md': '60vh',
				'dialog-lg': '80vh',
				'dialog-xl': '90vh',
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Keyframes oficiais da Aceternity UI
				moveHorizontal: {
					'0%': {
						transform: 'translateX(-50%) translateY(-10%)',
					},
					'50%': {
						transform: 'translateX(50%) translateY(10%)',
					},
					'100%': {
						transform: 'translateX(-50%) translateY(-10%)',
					},
				},
				moveInCircle: {
					'0%': {
						transform: 'rotate(0deg)',
					},
					'50%': {
						transform: 'rotate(180deg)',
					},
					'100%': {
						transform: 'rotate(360deg)',
					},
				},
				moveVertical: {
					'0%': {
						transform: 'translateY(-50%)',
					},
					'50%': {
						transform: 'translateY(50%)',
					},
					'100%': {
						transform: 'translateY(-50%)',
					},
				},
				// Keyframes para o texto gradiente
				gradient: {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" },
				},
				// Standard animation keyframes
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-down': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'zoom-out': {
					'0%': { transform: 'scale(1.05)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Background Gradient Animations
				first: 'moveVertical 30s ease infinite',
				second: 'moveInCircle 20s reverse infinite',
				third: 'moveInCircle 40s linear infinite',
				fourth: 'moveHorizontal 40s ease infinite',
				fifth: 'moveInCircle 20s ease infinite',
				// Animação para o texto gradiente
				gradient: "gradient 8s linear infinite",
				// Keyframes para o NeonGradientCard
				"background-position-spin": {
					"0%": { backgroundPosition: "top center" },
					"100%": { backgroundPosition: "bottom center" },
				},
				// Animação para o NeonGradientCard
				"background-position-spin": "background-position-spin 3000ms infinite alternate",
				// Standardized transitions and animations
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'zoom-in': 'zoom-in 0.2s ease-out',
				'zoom-out': 'zoom-out 0.2s ease-out',
			},

			// ============================================================================
			// TEXT SHADOW SYSTEM - Standardized Shadow Utilities
			// ============================================================================
			textShadow: {
				// Basic shadows
				'sm': '0 1px 1px rgba(0, 0, 0, 0.3)',
				'DEFAULT': '0 1px 2px rgba(0, 0, 0, 0.4)',
				'md': '0 1px 3px rgba(0, 0, 0, 0.6)',
				'lg': '0 2px 4px rgba(0, 0, 0, 0.8)',
				'xl': '0 3px 6px rgba(0, 0, 0, 0.9)',
				'none': 'none',

				// Semantic shadows
				'subtle': '0 1px 1px rgba(0, 0, 0, 0.3)',
				'light': '0 1px 2px rgba(0, 0, 0, 0.4)',
				'medium': '0 1px 3px rgba(0, 0, 0, 0.6)',
				'strong': '0 2px 4px rgba(0, 0, 0, 0.8)',

				// Glow effects - standardizes the common pattern
				'glow-yellow': '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)',
				'glow-gold': '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 215, 0, 0.2)',
				'glow-blue': '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(59, 130, 246, 0.2)',
				'glow-green': '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(16, 185, 129, 0.2)',
				'glow-purple': '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(139, 92, 246, 0.2)',

				// Typography specific
				'heading': '0 2px 4px rgba(0, 0, 0, 0.8)',
				'subheading': '0 1px 3px rgba(0, 0, 0, 0.6)',
				'body': '0 1px 2px rgba(0, 0, 0, 0.4)',

				// Special effects
				'inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
				'outline': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.8)',
			},

			// ============================================================================
			// Z-INDEX LAYERING SYSTEM - Semantic Layer Management
			// ============================================================================
			zIndex: {
				// Base layers
				'base': '0',
				'below': '-1',
				'above': '1',

				// Content layers
				'content': '10',
				'elevated': '20',
				'overlay': '30',

				// Navigation layers
				'nav': '40',
				'header': '50',

				// Interactive layers
				'dropdown': '100',
				'popup': '200',
				'modal': '300',
				'tooltip': '400',

				// System layers
				'notification': '500',
				'loading': '600',
				'skip-nav': '9999',

				// Special cases (existing high values)
				'tooltip-high': '50000',  // For tooltips that need to be above everything
				'max': '99999',
			}
		}
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require("tailwindcss-animate"),
		// Plugin para scrollbar customizada
		function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
			const scrollbarUtilities = {
				'.scrollbar-thin': {
					'scrollbar-width': 'thin',
				},
				'.scrollbar-none': {
					'scrollbar-width': 'none',
					'-ms-overflow-style': 'none',
				},
				'.scrollbar-none::-webkit-scrollbar': {
					'display': 'none',
				},
				'.scrollbar-thumb-amber-400\\/30::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.3)',
					'border-radius': '0.25rem',
				},
				'.scrollbar-thumb-amber-400\\/50::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.5)',
					'border-radius': '0.25rem',
				},
				'.scrollbar-track-transparent::-webkit-scrollbar-track': {
					'background-color': 'transparent',
				},
				'.hover\\:scrollbar-thumb-amber-400\\/50:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.5)',
				},
			};
			addUtilities(scrollbarUtilities);
		},
		// Plugin for text-shadow utilities
		function({ matchUtilities, theme }: { matchUtilities: (utilities: Record<string, (value: string) => Record<string, string>>, options: { values: Record<string, string> }) => void, theme: (key: string) => Record<string, string> }) {
			matchUtilities(
				{
					'text-shadow': (value: string) => ({
						textShadow: value,
					}),
				},
				{ values: theme('textShadow') }
			);
		}
	],
} satisfies Config;
