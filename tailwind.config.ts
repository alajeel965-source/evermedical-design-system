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
			padding: {
				DEFAULT: '1rem',
				md: '1.5rem',
			},
			screens: {
				'sm': '640px',
				'md': '768px', 
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1280px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				/* Medical Brand Colors */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				
				/* Navy Tab System */
				navy: {
					DEFAULT: 'hsl(var(--navy))',
					hover: 'hsl(var(--navy-hover))',
					light: 'hsl(var(--navy-light))',
					foreground: 'hsl(var(--navy-foreground))',
					muted: 'hsl(var(--navy-muted))'
				},
				
				/* Medical Status Colors */
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				
				/* Medical Sky Theme */
				sky: {
					DEFAULT: 'hsl(var(--sky))',
					foreground: 'hsl(var(--sky-foreground))'
				},
				
				/* Text Hierarchy */
				heading: 'hsl(var(--heading))',
				body: 'hsl(var(--body))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				
				/* Surfaces */
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				surface: 'hsl(var(--surface))',
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				
				/* Sidebar */
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
			
			/* Medical Design System Spacing */
			spacing: {
				'xs': 'var(--space-xs)',
				'sm': 'var(--space-sm)', 
				'md': 'var(--space-md)',
				'lg': 'var(--space-lg)',
				'xl': 'var(--space-xl)',
				'2xl': 'var(--space-2xl)'
			},
			
			/* Medical Radius System */
			borderRadius: {
				'medical-sm': 'var(--radius-sm)',   /* inputs */
				'medical-md': 'var(--radius-md)',   /* cards */
				'medical-lg': 'var(--radius-lg)',   /* pills */
				lg: 'var(--radius-sm)',
				md: 'calc(var(--radius-sm) - 2px)',
				sm: 'calc(var(--radius-sm) - 4px)'
			},
			
			/* Medical Soft Shadows */
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medical': 'var(--shadow-medium)',
				'medical-lg': 'var(--shadow-large)'
			},
			
			/* Medical Typography Scale */
			fontSize: {
				'medical-xs': 'var(--text-xs)',
				'medical-sm': 'var(--text-sm)',
				'medical-base': 'var(--text-base)',
				'medical-lg': 'var(--text-lg)',
				'medical-xl': 'var(--text-xl)',
				'medical-2xl': 'var(--text-2xl)',
				'medical-3xl': 'var(--text-3xl)',
				'medical-4xl': 'var(--text-4xl)',
				'medical-5xl': 'var(--text-5xl)'
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
				'fadeIn': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slideIn': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-in': 'slideIn 0.2s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			
			/* Enhanced Responsive Breakpoints */
			screens: {
				'xs': '475px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				'3xl': '1920px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
