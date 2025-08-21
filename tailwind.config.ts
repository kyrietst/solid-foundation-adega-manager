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
				'sf-pro': ['SF Pro Display', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
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
			}
		}
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require("tailwindcss-animate"),
		// Plugin para scrollbar customizada
		function({ addUtilities }: any) {
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
		}
	],
} satisfies Config;
