# Padronização de Cards - Sistema Adega Manager

> **Documentação completa para padronização de todos os cards do sistema**

## 📋 Visão Geral

Esta documentação define o padrão visual e técnico para todos os cards utilizados no Adega Manager, garantindo consistência visual, experiência de usuário uniforme e facilidade de manutenção em todo o sistema.

## 🎨 Sistema de Cards Base

### **Card Primitivo Principal**

```tsx
// Localização: src/shared/ui/primitives/card.tsx
const Card = (
  <div className="hero-spotlight rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md text-card-foreground shadow-[0_8px_24px_rgba(0,0,0,0.6)]" />
)
```

#### **Especificações do Card Base:**
- **Background**: `bg-black/70` (fundo preto com 70% de opacidade)
- **Backdrop**: `backdrop-blur-md` (desfoque médio de 12px)
- **Borda**: `border-white/20` (borda branca com 20% de opacidade)
- **Cantos**: `rounded-2xl` (16px de border-radius)
- **Sombra**: `shadow-[0_8px_24px_rgba(0,0,0,0.6)]` (sombra personalizada preta)
- **Efeito**: `hero-spotlight` (efeito de spotlight interativo no hover)

### **Efeito Hero Spotlight**

O efeito `hero-spotlight` adiciona interatividade ao card:

```tsx
onMouseMove={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--x", `${x}%`);
  e.currentTarget.style.setProperty("--y", `${y}%`);
}}
```

## 🎭 Variantes de Cards

### **1. StatCard - Sistema de Variantes**

```tsx
// Localização: src/shared/ui/composite/stat-card.tsx
export interface StatCardProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'premium';
}
```

#### **Variantes Disponíveis:**

##### **Default (Padrão)**
```scss
// Classes CSS
border: border-white/20
background: bg-black/70 backdrop-blur-md
title: text-gray-300
value: text-gray-100  
description: text-gray-400
icon: secondary (gray-400)
```

##### **Success (Verde)**
```scss
// Classes CSS específicas
border: border-accent-green/30
background: bg-accent-green/5 (sobre o base)
title: text-gray-300
value: text-accent-green
description: text-gray-400  
icon: success (green)
```

##### **Warning (Amarelo)**
```scss
// Classes CSS específicas
border: border-primary-yellow/30
background: bg-primary-yellow/5 (sobre o base)
title: text-gray-300
value: text-primary-yellow
description: text-gray-400
icon: warning (yellow)
```

##### **Error (Vermelho)**
```scss
// Classes CSS específicas
border: border-accent-red/30
background: bg-accent-red/5 (sobre o base)
title: text-gray-300
value: text-accent-red
description: text-gray-400
icon: error (red)
```

##### **Purple (Roxo)** ⭐
```scss
// Classes CSS específicas
border: border-accent-purple/30
background: bg-accent-purple/5 (sobre o base)
title: text-gray-300
value: text-accent-purple
description: text-gray-400
icon: primary (purple)
```

##### **Premium (Gold)**
```scss
// Classes CSS específicas
glass-premium: enhanced glass effect
title: text-gray-300
value: text-primary-yellow
description: text-gray-400
icon: primary (gold)
```

### **2. Glass Card Variants**

```tsx
// Localização: src/core/config/theme-utils.ts
export function getGlassCardClasses(variant: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow')
```

#### **Variantes Glass:**

##### **Default**
```scss
class: "glass-card rounded-lg"
// Background padrão com vidro sutil
```

##### **Premium**
```scss
class: "glass-premium rounded-lg"  
// Efeito de vidro intensificado
```

##### **Subtle**
```scss
class: "glass-subtle rounded-lg border border-gray-700/50"
// Efeito de vidro mais sutil
```

##### **Strong**
```scss
class: "glass-strong rounded-lg border border-gray-600"
// Efeito de vidro mais forte
```

##### **Yellow**
```scss
class: "glass-yellow rounded-lg"
// Efeito de vidro com tint amarelo
```

## 🎨 Sistema de Cores e Transparências

### **Paleta de Cores Adega Wine Cellar**

```scss
// Cores Principais
--adega-black: hsl(0, 0%, 8%)        // #141414
--adega-charcoal: hsl(0, 0%, 16%)    // #292929
--adega-gray: hsl(0, 0%, 24%)        // #3D3D3D
--adega-slate: hsl(0, 0%, 32%)       // #525252

// Cores de Acento  
--accent-green: hsl(142, 76%, 36%)   // #16A34A
--accent-red: hsl(0, 84%, 60%)       // #EF4444
--accent-purple: hsl(271, 81%, 56%)  // #A855F7
--accent-blue: hsl(221, 83%, 53%)    // #3B82F6

// Cores Primárias
--primary-yellow: hsl(45, 100%, 70%) // #FFDA04
--adega-yellow: hsl(45, 100%, 70%)   // #FFDA04
```

### **Níveis de Transparência**

```scss
// Backgrounds
bg-black/70    // 70% opacidade - Card principal
bg-black/80    // 80% opacidade - Card dashboard
bg-black/60    // 60% opacidade - Card sutil
bg-black/90    // 90% opacidade - Card forte

// Bordas
border-white/20     // 20% opacidade - Padrão
border-white/10     // 10% opacidade - Sutil
border-white/30     // 30% opacidade - Destacado

// Acentos coloridos
border-accent-green/30   // 30% opacidade
bg-accent-green/5        // 5% opacidade - background sutil
```

### **Backdrop Blur Levels**

```scss
backdrop-blur-sm   // 4px  - Sutil
backdrop-blur-md   // 12px - Padrão
backdrop-blur-lg   // 16px - Intenso  
backdrop-blur-xl   // 24px - Muito intenso
```

## ✨ Animações e Efeitos

### **Hover Animations**

```scss
// Hover Transform (StatCard)
hover:transform hover:-translate-y-1 transition-all duration-200

// Breakdown:
transform: scale(1) translateY(0)     // Estado inicial
hover:transform: scale(1) translateY(-4px)  // Estado hover
transition-all: all properties        // Anima todas as propriedades
duration-200: 200ms                   // Duração da animação
```

### **Hero Spotlight Effect**

```css
/* Efeito CSS customizado (hero-spotlight) */
.hero-spotlight {
  position: relative;
  overflow: hidden;
}

.hero-spotlight::before {
  content: '';
  position: absolute;
  top: var(--y, 0);
  left: var(--x, 0);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 218, 4, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hero-spotlight:hover::before {
  opacity: 1;
}
```

### **Gradient Animations**

```scss
// Para elementos com gradientes animados
animate-gradient: "gradient 8s linear infinite"

@keyframes gradient {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
```

## 🏗️ Estrutura de Componentes

### **Card Base Structure**

```tsx
<Card className="variant-classes">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Título</CardTitle>
    <Icon className="h-4 w-4" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">Valor</div>
    <p className="text-xs text-muted-foreground">Descrição</p>
  </CardContent>
</Card>
```

### **Padding Standards**

```scss
// Card Components
CardHeader: "p-5"           // 20px all sides
CardContent: "p-6 pt-0"     // 24px horizontal/bottom, 0 top
CardFooter: "p-6 pt-0"      // 24px horizontal/bottom, 0 top

// Container Cards (Dashboard)
Container: "p-6 pt-6"       // 24px all sides
```

## 📐 Dimensões e Espaçamentos

### **Card Sizes**

```scss
// Altura padrão
min-height: auto           // Cresce conforme conteúdo

// Largura responsiva
width: 100%               // Mobile
lg:width: auto            // Desktop (grid-based)

// Grid Layout
grid-cols-1               // Mobile: 1 coluna
md:grid-cols-2            // Tablet: 2 colunas  
lg:grid-cols-4            // Desktop: 4 colunas
```

### **Gaps e Spacing**

```scss
// Grid Gaps
gap-4: 16px               // Gap entre cards pequenos
gap-6: 24px               // Gap entre cards grandes

// Internal Spacing
p-4: 16px                 // Padding pequeno
p-6: 24px                 // Padding padrão
p-8: 32px                 // Padding grande
```

## 🎯 Guidelines de Uso

### **Quando usar cada variante:**

#### **Default**
- KPIs neutros
- Informações gerais
- Cards de navegação

#### **Success (Verde)**
- Métricas positivas
- Status de sucesso
- Indicadores de crescimento

#### **Warning (Amarelo)**
- Alertas importantes
- Valores que precisam de atenção
- Avisos do sistema

#### **Error (Vermelho)**
- Problemas críticos
- Estoque baixo
- Falhas do sistema

#### **Purple (Roxo)**
- Funcionalidades premium
- Destaque especial
- Métricas importantes
- **Uso recomendado**: Cards que precisam se destacar sem indicar erro/sucesso

#### **Premium (Gold)**
- Métricas financeiras
- Dados mais importantes
- Headers principais

### **Hierarquia Visual**

```
1. Premium (Gold) - Mais importante
2. Purple - Importante especial  
3. Success/Warning/Error - Status específicos
4. Default - Informação padrão
```

## 🔧 Implementação Prática

### **Template Base para Novos Cards**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { cn } from '@/core/config/theme-utils';

interface CustomCardProps {
  title: string;
  content: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'premium';
  className?: string;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  title,
  content,
  variant = 'default', 
  className
}) => {
  const variantStyles = {
    default: '',
    success: 'border-accent-green/30 bg-accent-green/5',
    warning: 'border-primary-yellow/30 bg-primary-yellow/5', 
    error: 'border-accent-red/30 bg-accent-red/5',
    purple: 'border-accent-purple/30 bg-accent-purple/5',
    premium: 'border-primary-yellow/40 bg-primary-yellow/10'
  };

  return (
    <Card className={cn(
      'hover:transform hover:-translate-y-1 transition-all duration-200',
      variantStyles[variant],
      className
    )}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};
```

### **StatCard Usage Example**

```tsx
import { StatCard } from '@/shared/ui/composite/stat-card';
import { DollarSign } from 'lucide-react';

// Card roxo para destaque especial
<StatCard
  title="Vendas Premium"
  value="R$ 15.230,00"
  description="↗️ +12% vs mês anterior"
  icon={DollarSign}
  variant="purple"
/>

// Card premium para métricas financeiras principais
<StatCard
  title="Receita Total"
  value="R$ 45.680,00"
  description="Faturamento do mês"
  icon={DollarSign}
  variant="premium"
/>
```

## ✅ Checklist de Implementação

Para implementar um novo card seguindo este padrão:

- [ ] Usar componente `Card` base do sistema
- [ ] Aplicar variante apropriada (`purple` para destaque especial)
- [ ] Incluir hover animation (`hover:-translate-y-1`)
- [ ] Definir padding adequado (p-6 padrão)
- [ ] Usar cores da paleta Adega Wine Cellar
- [ ] Aplicar backdrop-blur apropriado
- [ ] Incluir sombra padrão do sistema
- [ ] Testar responsividade mobile/desktop
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Verificar efeito hero-spotlight

## 🔍 Debugging e Validação

### **Classes CSS para Inspeção**

```scss
// Card principal
.hero-spotlight.rounded-2xl.border.border-white\/20.bg-black\/70.backdrop-blur-md

// Variante purple
.border-accent-purple\/30.bg-accent-purple\/5

// Hover animation
.hover\:transform.hover\:-translate-y-1.transition-all.duration-200
```

### **Ferramentas de Validação**

1. **DevTools**: Verificar classes CSS aplicadas
2. **Contrast Checker**: Validar legibilidade das cores
3. **Mobile Preview**: Testar responsividade
4. **Animation Inspector**: Verificar performance das animações

## 📊 Performance Guidelines

### **Otimizações Aplicadas**

```scss
// GPU Acceleration
transform: translateZ(0)        // Force GPU layer
will-change: transform          // Hint para otimização

// Efficient Transitions
transition-property: transform  // Apenas transform (mais rápido)
transition-duration: 200ms      // Duração otimizada
```

### **Best Practices**

- **Backdrop-blur**: Usar com moderação (impacto na performance)
- **Shadows**: Preferir CSS custom ao invés de múltiplas shadow classes
- **Animations**: Limitar a transform e opacity
- **Hero-spotlight**: Usar apenas em cards importantes

## 🎨 Exemplos Visuais de Cada Variante

### **Resultado Visual das Variantes**

```
┌─ Default ────────────────────┐    ┌─ Success ────────────────────┐
│ 📊 Vendas Totais             │    │ ✅ Metas Atingidas          │
│ 1,234                        │    │ 98%                         │
│ ↗️ +5% vs mês anterior       │    │ ✨ Excelente performance    │
└──────────────────────────────┘    └──────────────────────────────┘

┌─ Warning ────────────────────┐    ┌─ Error ──────────────────────┐  
│ ⚠️ Estoque Baixo             │    │ ❌ Falhas Sistema            │
│ 12 itens                     │    │ 3 erros                     │
│ 🔔 Requer atenção           │    │ 🚨 Ação imediata           │
└──────────────────────────────┘    └──────────────────────────────┘

┌─ Purple ─────────────────────┐    ┌─ Premium ────────────────────┐
│ 💜 Clientes Premium          │    │ 🏆 Receita Principal         │  
│ 245 ativos                   │    │ R$ 125.430,00               │
│ ⭐ Segmento especial         │    │ 💰 Meta do trimestre        │
└──────────────────────────────┘    └──────────────────────────────┘
```

## 🎨 Padronização de Headers - Títulos com Animações

### **Sistema de Títulos Padrão (v2.0.0)**

O sistema implementa um padrão visual consistente para todos os headers principais das páginas, garantindo uniformidade e impacto visual em todo o sistema.

### **Componentes dos Headers**

#### **1. Animação BlurIn (Aceternity UI)**

```tsx
// Localização: src/components/ui/blur-in.tsx
import { BlurIn } from "@/components/ui/blur-in";

<BlurIn
  word="DASHBOARD"
  duration={1.2}
  variant={{
    hidden: { filter: "blur(15px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 }
  }}
  className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
/>
```

#### **Especificações da Animação BlurIn:**
- **Duration**: `1.2s` - Duração padrão para entrada suave
- **Blur inicial**: `blur(15px)` - Desfoque inicial máximo  
- **Opacity inicial**: `0` - Transparência total no início
- **Blur final**: `blur(0px)` - Sem desfoque no final
- **Opacity final**: `1` - Totalmente visível no final
- **Trigger**: Entrada automática na montagem do componente

#### **2. Texto com Gradiente Animado (GradientText)**

```tsx
// Componente oficial: GradientText (Implementação da página de Vendas)
import { GradientText } from "@/components/ui/gradient-text";

<GradientText
  colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
  animationSpeed={6}
  showBorder={false}
  className="text-xl lg:text-2xl font-bold"
>
  PONTO DE VENDA
</GradientText>
```

#### **Análise Técnica da Animação do Gradiente:**

##### **Configuração de Cores (5 pontos):**
```tsx
colors: ["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]
//        Vermelho → Amarelo → Vermelho → Amarelo → Vermelho
//        Início     25%      50%        75%      Final
```

##### **Sistema CSS Interno do GradientText:**
```css
/* Aplicado automaticamente pelo componente */
.text-transparent {
  color: transparent;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.animate-gradient {
  animation: gradient 6s linear infinite;
}

/* Style inline aplicado pelo componente */
style={{
  backgroundImage: "linear-gradient(to right, #FF2400, #FFDA04, #FF2400, #FFDA04, #FF2400)",
  backgroundSize: "300% 100%",
  animationDuration: "6s"
}}
```

##### **Keyframe da Animação:**
```css
/* Definido em tailwind.config.ts */
@keyframes gradient {
  0% { 
    background-position: 0% 50%; 
    /* Mostra: #FF2400 (início) */
  }
  25% { 
    background-position: 75% 50%; 
    /* Transição: #FF2400 → #FFDA04 */
  }
  50% { 
    background-position: 150% 50%; 
    /* Mostra: #FFDA04 (meio) */
  }
  75% { 
    background-position: 225% 50%; 
    /* Transição: #FFDA04 → #FF2400 */
  }
  100% { 
    background-position: 300% 50%; 
    /* Volta ao início: #FF2400 */
  }
}
```

#### **Especificações da Animação do Gradiente:**

##### **Parâmetros Técnicos:**
- **Cores**: `["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]` - Padrão 5 pontos
- **Background size**: `300% 100%` - Tamanho expandido para movimento suave
- **Animation speed**: `6s` - Ciclo completo (6 segundos)
- **Animation timing**: `linear` - Velocidade constante
- **Animation iteration**: `infinite` - Loop contínuo
- **Background clip**: `text` - Gradiente aplicado apenas ao texto
- **Text color**: `transparent` - Permite visualização do gradiente

##### **Efeito Visual:**
1. **0s-1.5s**: Vermelho dominante visível
2. **1.5s-3s**: Transição vermelho → amarelo
3. **3s-4.5s**: Amarelo dominante visível  
4. **4.5s-6s**: Transição amarelo → vermelho
5. **6s**: Reinicia o ciclo

##### **Performance da Animação:**
- **GPU acceleration**: Utiliza `background-position` (otimizado)
- **No layout shift**: Apenas mudança de cores, sem impacto no layout
- **Smooth transition**: 300% background size garante transições suaves
- **Low resource**: Animação CSS pura, sem JavaScript

#### **3. Sublinhado Estilizado Multicamadas**

```tsx
{/* Sistema de sublinhado elegante - 4 camadas */}
<div className="w-full h-6 relative mt-2">
  {/* Camada 1: Vermelho com blur */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
  
  {/* Camada 2: Vermelho sólido */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
  
  {/* Camada 3: Amarelo com blur (menor largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
  
  {/* Camada 4: Amarelo sólido (menor largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
</div>
```

#### **Especificações do Sublinhado:**

##### **Estrutura em Camadas:**
1. **Camada Base (Vermelha com Blur)**
   - Cor: `#FF2400` com 80% de opacidade
   - Largura: `100%` (w-full)
   - Altura: `2px` (h-[2px])
   - Efeito: `blur-sm` (4px de desfoque)

2. **Camada Sólida (Vermelha)**
   - Cor: `#FF2400` opacidade total
   - Largura: `100%` (w-full)
   - Altura: `1px` (h-px)
   - Efeito: Sem blur (linha definida)

3. **Camada Acento (Amarela com Blur)**
   - Cor: `#FFDA04` com 80% de opacidade
   - Largura: `75%` (w-3/4)
   - Altura: `3px` (h-[3px])
   - Efeito: `blur-sm` (4px de desfoque)
   - Posição: Centralizada (`mx-auto`)

4. **Camada Acento Sólida (Amarela)**
   - Cor: `#FFDA04` opacidade total
   - Largura: `75%` (w-3/4) 
   - Altura: `1px` (h-px)
   - Efeito: Sem blur (linha definida)
   - Posição: Centralizada (`mx-auto`)

### **Paleta de Cores dos Headers**

```scss
// Cores Oficiais Adega Wine Cellar para Headers
--header-red: #FF2400      // Vermelho principal
--header-yellow: #FFDA04   // Amarelo/dourado principal

// Gradientes padrão
bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]  // Texto
bg-gradient-to-r from-transparent via-[#FF2400] to-transparent  // Sublinhado vermelho
bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent  // Sublinhado amarelo
```

### **CSS Keyframes para Animações**

```css
/* Configuração no tailwind.config.ts */
keyframes: {
  gradient: {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  }
}

animation: {
  gradient: "gradient 8s linear infinite"
}
```

### **Templates Padrão de Headers**

#### **Template 1: Header com BlurIn (Recomendado para páginas estáticas)**

```tsx
import { BlurIn } from "@/components/ui/blur-in";
import { cn } from '@/core/config/utils';

interface PageHeaderProps {
  title: string;
  variant?: 'default' | 'premium' | 'subtle';
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  variant = 'premium', 
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Header Container */}
              <div className="relative w-full text-left px-4 lg:px-8">
                {/* Título com BlurIn e gradiente */}
                <BlurIn
                  word={title}
                  duration={1.2}
                  variant={{
                    hidden: { filter: "blur(15px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1 }
                  }}
                  className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
                  }}
                />
                
                {/* Sublinhado elegante multicamadas */}
                <div className="w-full h-6 relative mt-2">
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### **Template 2: Header com GradientText (Recomendado para páginas interativas)**

```tsx
import { GradientText } from "@/components/ui/gradient-text";
import { cn } from '@/core/config/utils';

interface AnimatedPageHeaderProps {
  title: string;
  animationSpeed?: number;
  className?: string;
}

export const AnimatedPageHeader: React.FC<AnimatedPageHeaderProps> = ({
  title,
  animationSpeed = 6,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Header Container */}
              <div className="relative w-full text-center"> {/* Note: text-center para GradientText */}
                {/* Título com GradientText animado */}
                <GradientText
                  colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
                  animationSpeed={animationSpeed}
                  showBorder={false}
                  className="text-xl lg:text-2xl font-bold"
                >
                  {title}
                </GradientText>
                
                {/* Sublinhado elegante multicamadas */}
                <div className="w-full h-6 relative mt-2">
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **Implementações Existentes**

#### **Dashboard Header** (`src/features/dashboard/components/DashboardHeader.tsx`)
- ✅ **GradientText** com animação contínua implementada (Template 2)
- ✅ Configuração: `colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}`
- ✅ **AnimationSpeed**: `6s` para ciclo completo
- ✅ Sublinhado multicamadas (4 camadas)
- ✅ Responsividade: `text-xl lg:text-2xl`
- ✅ Alinhamento: `text-left` para consistência com cards

#### **Sales Page Header** (`src/features/sales/components/SalesPage.tsx`)
- ✅ **GradientText** com animação contínua (Template 2 - REFERÊNCIA)
- ✅ Configuração: `colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}`
- ✅ **AnimationSpeed**: `6s` (6 segundos por ciclo)
- ✅ Sublinhado elegante multicamadas
- ✅ Alinhamento: `text-center` 
- ✅ Cores padronizadas do sistema Adega Wine Cellar

#### **Comparação Técnica das Implementações:**

```tsx
// Sales Page (REFERÊNCIA ORIGINAL)
<GradientText
  colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
  animationSpeed={6}
  showBorder={false}
  className="text-xl lg:text-2xl font-bold"
>
  PONTO DE VENDA
</GradientText>

// Dashboard (ATUALIZADO PARA SEGUIR REFERÊNCIA)
<GradientText
  colors={["#FF2400", "#FFDA04", "#FF2400", "#FFDA04", "#FF2400"]}
  animationSpeed={6}
  showBorder={false}
  className="text-xl lg:text-2xl font-bold"
>
  DASHBOARD
</GradientText>
```

**Ambas implementações agora seguem exatamente o mesmo padrão da animação do gradiente.**

### **Guidelines de Implementação**

#### **Para Novos Headers:**
1. **Sempre use BlurIn** para entrada suave dos títulos
2. **Gradiente obrigatório** - vermelho-amarelo-vermelho
3. **Sublinhado multicamadas** - 4 camadas conforme especificação
4. **Responsividade** - text-xl no mobile, text-2xl no desktop
5. **Alinhamento** - text-left para alinhamento com cards
6. **Padding** - px-4 lg:px-8 para consistência

#### **Checklist de Validação:**
- [ ] BlurIn animation com duration 1.2s
- [ ] Gradiente com cores #FF2400 e #FFDA04
- [ ] Sublinhado com 4 camadas (2 vermelhas + 2 amarelas)
- [ ] Text shadow para profundidade
- [ ] Responsividade text-xl/text-2xl
- [ ] Padding lateral consistente
- [ ] Container altura fixa (h-6 para sublinhado)

### **Performance e Acessibilidade**

#### **Otimizações:**
```scss
// GPU acceleration para animações
transform: translateZ(0)
will-change: filter, opacity

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .blur-in-animation {
    animation: none;
    filter: blur(0px);
    opacity: 1;
  }
}
```

#### **Acessibilidade:**
- **Contraste**: Gradiente garante contraste mínimo WCAG AA
- **Motion**: Respeita prefers-reduced-motion
- **Screen readers**: Texto permanece legível durante animação
- **Focus**: Elementos mantêm foco keyboard visível

---

## 📝 Status do Sistema

**Sistema de Cards**: ✅ **PADRONIZADO E DOCUMENTADO**  
**Sistema de Headers**: ✅ **PADRONIZADO E DOCUMENTADO**

Esta documentação serve como referência completa para implementação consistente de cards e headers em todo o sistema Adega Manager, garantindo qualidade visual, performance otimizada e experiência de usuário uniforme.