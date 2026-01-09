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
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["Inter", "Space Grotesk", "SF Pro Display", "system-ui", "sans-serif"],
				heading: ["Space Grotesk", "SF Pro Display", "Inter", "sans-serif"],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				// Colors for Living Gold Login
				"gold-anita": "#ffd11a",
				"gold-muted": "#cec18d",
				"surface-dark": "#18181b",
				
				// SEMANTIC BRAND TOKENS (Adega Anita's Theme)
				brand: {
					DEFAULT: "hsl(var(--brand))",
					foreground: "hsl(var(--brand-foreground))",
					highlight: "hsl(var(--brand-highlight))", // Amarelo mais claro para Hovers
				},

				// STITCH DASHBOARD V4 COLORS
				primary: {
					DEFAULT: "#f4ca25", // Stitch Gold
					foreground: "#000000",
					dark: "#bfa01d",
				},
				"background-dark": "#050505",
				"glass-border": "rgba(255, 255, 255, 0.08)",
				
				surface: {
					DEFAULT: "hsl(var(--surface))",
					foreground: "hsl(var(--surface-foreground))",
					glass: "hsl(var(--surface-glass))", // Para cards transparentes
				},

				// primary: { REMOVED - Using Stitch Gold above },
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				
				// CHART SYSTEM (Mantendo compatibilidade)
				"chart-1": "hsl(var(--chart-1))",
				"chart-2": "hsl(var(--chart-2))",
				"chart-3": "hsl(var(--chart-3))",
				"chart-4": "hsl(var(--chart-4))",
				"chart-5": "hsl(var(--chart-5))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
			},
			// MANTER ANIMAÇÕES E KEYFRAMES EXISTENTES
			keyframes: {
				breathe: {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.2' },
					'50%': { transform: 'scale(1.15)', opacity: '0.5' },
				},
				float: {
					'0%, 100%': { transform: 'translate(0, 0) scale(1.1)' },
					'33%': { transform: 'translate(2%, 2%) scale(1.15)' },
					'66%': { transform: 'translate(-2%, 1%) scale(1.12)' },
				},
				rise: {
					'0%': { transform: 'translateY(110vh) scale(0)', opacity: '0' },
					'10%': { opacity: '0.6' },
					'90%': { opacity: '0.6' },
					'100%': { transform: 'translateY(-20vh) scale(1)', opacity: '0' },
				},
				shimmer: {
					'0%': { backgroundPosition: '200% center' },
					'100%': { backgroundPosition: '-200% center' },
				},
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				"fade-out": {
					"0%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				"slide-up": {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				"zoom-in": {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.3s ease-out",
				"fade-out": "fade-out 0.3s ease-out",
				"slide-up": "slide-up 0.3s ease-out",
				"zoom-in": "zoom-in 0.2s ease-out",
				'breathe': 'breathe 7s ease-in-out infinite',
				'float': 'float 20s ease-in-out infinite',
				'rise': 'rise 10s linear infinite',
				'shimmer': 'shimmer 4s linear infinite',
			},
			// UTILS ESPECÍFICOS DO ADEGA ENTERPRISE
			textShadow: {
				sm: '0 1px 1px rgba(0, 0, 0, 0.3)',
				DEFAULT: '0 1px 2px rgba(0, 0, 0, 0.4)',
				glow: '0 0 20px rgba(255, 215, 0, 0.3)', // Gold Glow
			},
		},
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require("tailwindcss-animate"),
		// Plugin para scrollbar customizada - Sistema Adega
		function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
			const scrollbarUtilities = {
				// Base scrollbar styles
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

				// Webkit scrollbar sizing
				'.scrollbar-thin::-webkit-scrollbar': {
					'width': '8px',
					'height': '8px',
				},
				'.scrollbar-ultra-thin::-webkit-scrollbar': {
					'width': '4px',
					'height': '4px',
				},

				// Track styles
				'.scrollbar-track-transparent::-webkit-scrollbar-track': {
					'background-color': 'transparent',
				},
				'.scrollbar-track-dark::-webkit-scrollbar-track': {
					'background-color': 'rgb(17 24 39 / 0.3)', // gray-900/30
					'border-radius': '0.25rem',
				},

				// Thumb styles - Dark theme
				'.scrollbar-thumb-dark::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(75 85 99 / 0.6)', // gray-600/60
					'border-radius': '0.25rem',
					'border': '2px solid transparent',
					'background-clip': 'padding-box',
				},
				'.scrollbar-thumb-dark-subtle::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(75 85 99 / 0.3)', // gray-600/30
					'border-radius': '0.25rem',
				},

				// Thumb styles - Adega theme
				'.scrollbar-thumb-adega::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(255 215 0 / 0.4)', // accent-gold-100/40
					'border-radius': '0.25rem',
				},
				'.scrollbar-thumb-adega-subtle::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(255 215 0 / 0.2)', // accent-gold-100/20
					'border-radius': '0.25rem',
				},

				// Legacy amber support
				'.scrollbar-thumb-amber-400\\/30::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.3)',
					'border-radius': '0.25rem',
				},
				'.scrollbar-thumb-amber-400\\/50::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.5)',
					'border-radius': '0.25rem',
				},

				// Hover effects
				'.hover\\:scrollbar-thumb-dark:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(75 85 99 / 0.8)', // gray-600/80
				},
				'.hover\\:scrollbar-thumb-adega:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(255 215 0 / 0.6)', // accent-gold-100/60
				},
				'.hover\\:scrollbar-thumb-amber-400\\/50:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(251 191 36 / 0.5)',
				},

				// Combined utility classes for easy usage
				'.scrollbar-dark': {
					'scrollbar-width': 'thin',
				},
				'.scrollbar-dark::-webkit-scrollbar': {
					'width': '8px',
					'height': '8px',
				},
				'.scrollbar-dark::-webkit-scrollbar-track': {
					'background-color': 'transparent',
				},
				'.scrollbar-dark::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(75 85 99 / 0.4)', // gray-600/40
					'border-radius': '0.25rem',
				},
				'.scrollbar-dark:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(75 85 99 / 0.6)', // gray-600/60
				},

				'.scrollbar-adega': {
					'scrollbar-width': 'thin',
				},
				'.scrollbar-adega::-webkit-scrollbar': {
					'width': '8px',
					'height': '8px',
				},
				'.scrollbar-adega::-webkit-scrollbar-track': {
					'background-color': 'transparent',
				},
				'.scrollbar-adega::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(255 215 0 / 0.3)', // accent-gold-100/30
					'border-radius': '0.25rem',
				},
				'.scrollbar-adega:hover::-webkit-scrollbar-thumb': {
					'background-color': 'rgb(255 215 0 / 0.5)', // accent-gold-100/50
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
