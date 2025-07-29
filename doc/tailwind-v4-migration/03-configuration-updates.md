# Atualizações de Configuração - Tailwind CSS v4

Este documento detalha todas as mudanças necessárias nos arquivos de configuração para migrar para Tailwind v4.

## 1. tailwind.config.ts

### Configuração Atual (v3.4.11)
```typescript
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
			colors: { /* ... cores atuais ... */ },
			borderRadius: { /* ... border radius ... */ },
			keyframes: { /* ... 12 keyframes definidas ... */ },
			animation: { /* ... 7 animações definidas ... */ }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Nova Configuração (v4)
```typescript
import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		// MUDANÇA: remove "extend", coloca diretamente
		colors: {
			// Cores padrão do Tailwind v4 (incluídas automaticamente)
			// Cores personalizadas
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
			// Paleta Black to Yellow - Elegant Gold System
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
		// MUDANÇA: sintaxe mais limpa para container
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
			// Animações shadcn/ui
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--radix-accordion-content-height)' }
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)' },
				to: { height: '0' }
			},
			// Background Gradient Animations (mantidas)
			first: {
				'0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
				'33%': { transform: 'translate(30px, -50px) rotate(120deg)' },
				'66%': { transform: 'translate(-20px, 20px) rotate(240deg)' },
			},
			second: {
				'0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
				'33%': { transform: 'translate(-50px, 30px) rotate(120deg)' },
				'66%': { transform: 'translate(20px, -20px) rotate(240deg)' },
			},
			third: {
				'0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
				'33%': { transform: 'translate(20px, 50px) rotate(120deg)' },
				'66%': { transform: 'translate(-30px, -30px) rotate(240deg)' },
			},
			fourth: {
				'0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
				'33%': { transform: 'translate(-40px, -20px) rotate(120deg)' },
				'66%': { transform: 'translate(40px, 40px) rotate(240deg)' },
			},
			// Keyframes da documentação oficial Aceternity
			moveHorizontal: {
				'0%': { transform: 'translateX(-50%) translateY(-10%)' },
				'50%': { transform: 'translateX(50%) translateY(10%)' },
				'100%': { transform: 'translateX(-50%) translateY(-10%)' },
			},
			moveInCircle: {
				'0%': { transform: 'rotate(0deg)' },
				'50%': { transform: 'rotate(180deg)' },
				'100%': { transform: 'rotate(360deg)' },
			},
			moveVertical: {
				'0%': { transform: 'translateY(-50%)' },
				'50%': { transform: 'translateY(50%)' },
				'100%': { transform: 'translateY(-50%)' },
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
		}
	},
	// MUDANÇA: plugins podem precisar de atualização
	plugins: [
		// Verificar se tailwindcss-animate é compatível com v4
		require("tailwindcss-animate")
	],
} satisfies Config;
```

### Principais Mudanças
1. **Remove `darkMode`** - v4 detecta automaticamente
2. **Remove `prefix`** - não necessário se vazio
3. **Remove `extend`** - sintaxe mais direta
4. **Mantém todas as configurações personalizadas**
5. **Plugins podem precisar de verificação**

## 2. postcss.config.js

### Configuração Atual (v3)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Nova Configuração (v4)
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Mudanças
- **`tailwindcss`** → **`@tailwindcss/postcss`**
- Mantém `autoprefixer`

## 3. src/index.css

### Arquivo Atual (v3)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Variáveis CSS para tema */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... outras variáveis ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... outras variáveis ... */
}
```

### Novo Arquivo (v4)
```css
@import "tailwindcss";

/* Estilos personalizados - MANTER TODOS */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Variáveis CSS para tema - MANTER TODAS */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 0 0% 45.1%;
  --sidebar-primary: 0 0% 9%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 0 0% 96.1%;
  --sidebar-accent-foreground: 0 0% 9%;
  --sidebar-border: 0 0% 89.8%;
  --sidebar-ring: 0 0% 3.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --sidebar-background: 0 0% 3.9%;
  --sidebar-foreground: 0 0% 63.9%;
  --sidebar-primary: 0 0% 98%;
  --sidebar-primary-foreground: 0 0% 9%;
  --sidebar-accent: 0 0% 14.9%;
  --sidebar-accent-foreground: 0 0% 98%;
  --sidebar-border: 0 0% 14.9%;
  --sidebar-ring: 0 0% 83.1%;
}
```

### Mudanças
- **`@tailwind` directives** → **`@import "tailwindcss"`**
- **Manter todos os estilos personalizados**
- **Manter todas as variáveis CSS**

## 4. package.json

### Dependências Atuais
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.11",
    "autoprefixer": "^10.4.20",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Novas Dependências
```json
{
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Comandos de Atualização
```bash
# Remover v3
npm uninstall tailwindcss

# Instalar v4
npm install -D tailwindcss@next
npm install -D @tailwindcss/postcss@next

# Verificar compatibilidade do plugin
npm update tailwindcss-animate
```

## 5. Arquivos Vite (vite.config.ts)

### Verificação Necessária
O arquivo `vite.config.ts` atual deve continuar funcionando, mas verificar:

```typescript
// Verificar se há configurações específicas do Tailwind
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Certificar que não há configurações conflitantes
})
```

## 6. TypeScript (tsconfig.json)

### Status
✅ **Nenhuma mudança necessária** - Tailwind v4 mantém compatibilidade total com TypeScript.

## 7. Plugin tailwindcss-animate

### Verificação de Compatibilidade
```bash
# Verificar versão atual
npm list tailwindcss-animate

# Se necessário, atualizar
npm update tailwindcss-animate

# Ou instalar versão compatível
npm install -D tailwindcss-animate@latest
```

### Configuração no tailwind.config.ts
```typescript
// Manter como está, mas verificar funcionalidade
plugins: [require("tailwindcss-animate")]
```

## 8. Scripts de Build

### package.json - Manter Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### Verificações Pós-Migração
```bash
# Testar todos os scripts
npm run dev    # Deve funcionar normalmente
npm run build  # Verificar se build passa
npm run lint   # Verificar regras ESLint
npm run preview # Testar build de produção
```

## 9. Checklist de Validação

### ✅ Configurações Atualizadas
- [ ] `tailwind.config.ts` - Nova sintaxe v4
- [ ] `postcss.config.js` - Plugin @tailwindcss/postcss
- [ ] `src/index.css` - @import "tailwindcss"
- [ ] `package.json` - Dependências v4

### ✅ Funcionalidades Mantidas
- [ ] Todas as cores personalizadas
- [ ] Todas as animações keyframes
- [ ] Configurações de container
- [ ] Border radius personalizado
- [ ] Plugin tailwindcss-animate

### ✅ Compatibilidade
- [ ] Build sem erros
- [ ] Dev server funcional
- [ ] Hot reload funcionando
- [ ] TypeScript sem erros

---

**🎯 Objetivo**: Migração sem perda de funcionalidades com melhor suporte a classes arbitrárias
**⚠️ Atenção**: Testar intensivamente antes de commit final