# Padronização Header - Sistema Adega Manager

> **Documentação completa para padronização de headers em todas as páginas do sistema**

## =Ë Visão Geral

Esta documentação define o padrão visual e técnico para headers de páginas no Adega Manager, baseado na implementação da página de vendas (SalesPage). O objetivo é garantir consistência visual e UX em todo o sistema.

## <¨ Padrão Visual Estabelecido

### **Estrutura Base do Header**

```tsx
<div className="w-full h-full flex flex-col">
  {/* Header e Abas - altura fixa */}
  <div className="flex-shrink-0 pb-4">
    <div className="flex items-center justify-between gap-4">
      {/* Container do Header */}
      <div className="w-full sm:w-auto flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Header Principal */}
          <div className="relative w-full text-center sm:text-left bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
            {/* Conteúdo do header aqui */}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## <¯ Especificações Técnicas

### **1. Medidas e Espaçamentos**

#### **Padding e Margens**
```scss
// Container principal
padding-bottom: 1rem; // pb-4 (16px)

// Header card
padding: 1rem; // p-4 (16px)

// Gap entre elementos
gap: 1rem; // gap-4 (16px)

// Margem top do sublinhado
margin-top: 0.5rem; // mt-2 (8px)
```

#### **Altura e Layout**
```scss
// Container do header - altura fixa
.flex-shrink-0 // Não diminui quando há overflow

// Título - altura do sublinhado
height: 1.5rem; // h-6 (24px)
```

### **2. Sistema de Cores - Paleta Adega Wine Cellar**

#### **Cores Principais do Gradiente**
```scss
// Vermelho Adega (Primary)
--adega-red: #FF2400
--adega-red-alpha-5: rgba(255, 36, 0, 0.05)
--adega-red-alpha-80: rgba(255, 36, 0, 0.80)

// Amarelo Adega (Secondary)  
--adega-yellow: #FFDA04
--adega-yellow-alpha-10: rgba(255, 218, 4, 0.10)
--adega-yellow-alpha-80: rgba(255, 218, 4, 0.80)
--adega-yellow-alpha-20: rgba(255, 218, 4, 0.20)

// Fundo e bordas
--glass-bg: rgba(0, 0, 0, 0.20)
--glass-border: rgba(255, 255, 255, 0.10)
```

#### **Aplicação das Cores**
```tsx
// Background do container
bg-black/20 backdrop-blur-sm border border-white/10

// Gradiente do glow background
bg-gradient-to-r from-[#FF2400]/5 via-[#FFDA04]/10 to-[#FF2400]/5

// Gradiente do texto
text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]
```

### **3. Animações de Entrada**

#### **Componente BlurIn - Animação Principal**
```tsx
<BlurIn
  word="SEU TÍTULO AQUI"
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
```

#### **Parâmetros da Animação**
- **Duração**: 1.2 segundos
- **Efeito inicial**: Blur 15px + Opacidade 0  
- **Efeito final**: Blur 0px + Opacidade 1
- **Tipo**: Smooth transition com Framer Motion

### **4. Efeito de Sublinhado Animado**

#### **Estrutura HTML**
```tsx
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

#### **Especificações do Sublinhado**
- **Altura total**: 24px (h-6)
- **Camadas**: 4 layers sobrepostas
- **Gradiente**: From transparent ’ cor ’ transparent
- **Larguras**: Full width (vermelho) + 75% width (amarelo)
- **Espessuras**: 1px sólido + 2-3px blur

## <× Implementação por Tipo de Página

### **Template Base para Qualquer Página**

```tsx
import { BlurIn } from "@/components/ui/blur-in";
import { cn } from '@/core/config/utils';

interface PageHeaderProps {
  title: string;
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
}

function PageHeader({ title, variant = 'premium' }: PageHeaderProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header - altura fixa */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Header Container */}
              <div className="relative w-full text-center sm:text-left bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                
                {/* Glow background sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF2400]/5 via-[#FFDA04]/10 to-[#FF2400]/5 rounded-xl blur-xl" />
                
                <div className="relative">
                  {/* Título animado */}
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
                  
                  {/* Sublinhado elegante */}
                  <div className="w-full h-6 relative mt-2">
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                  </div>
                </div>
              </div>
              
              {/* Slot para botões adicionais (opcional) */}
              {/* Adicionar elementos específicos da página aqui */}
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo da página */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Conteúdo específico da página */}
      </div>
    </div>
  );
}

export { PageHeader };
```

## =Ú Exemplos de Aplicação

### **1. Página de Inventário**
```tsx
<PageHeader title="GESTÃO DE ESTOQUE" variant="premium" />
```

### **2. Página de Clientes (CRM)**  
```tsx
<PageHeader title="GESTÃO DE CLIENTES" variant="premium" />
```

### **3. Página de Entregas**
```tsx
<PageHeader title="CONTROLE DE ENTREGAS" variant="premium" />
```

### **4. Dashboard**
```tsx
<PageHeader title="PAINEL EXECUTIVO" variant="premium" />
```

## <› Variações de Estilo

### **Variants Disponíveis**
- **`default`**: Cores padrão do sistema
- **`premium`**: Gradiente vermelho-amarelo (recomendado)
- **`subtle`**: Versão mais sutil das cores
- **`strong`**: Cores mais vibrantes
- **`yellow`**: Predominância amarela

## =ñ Responsividade

### **Mobile (< 640px)**
- Título centralizado: `text-center`
- Layout em coluna: `flex-col`
- Tamanho do texto: `text-xl`

### **Desktop (e 640px)**
- Título alinhado à esquerda: `sm:text-left`
- Layout em linha: `sm:flex-row`
- Tamanho do texto: `lg:text-2xl`

## ¡ Performance

### **Otimizações Aplicadas**
- **Backdrop blur**: Efeito de vidro sem impacto na performance
- **CSS Transforms**: Animações via GPU
- **Lazy loading**: Componentes carregados sob demanda
- **Memo**: React.memo aplicado onde necessário

## =' Dependências Necessárias

### **Componentes**
```bash
# Componente de animação
@/components/ui/blur-in

# Utilitários
@/core/config/utils (cn function)
@/core/config/theme-utils (getGlassCardClasses)

# Framer Motion (já instalado)
framer-motion
```

### **Importações Padrão**
```tsx
import { BlurIn } from "@/components/ui/blur-in";
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
```

##  Checklist de Implementação

Para aplicar este padrão em uma nova página:

- [ ] Importar componentes necessários
- [ ] Aplicar estrutura base do layout
- [ ] Configurar título da página com BlurIn
- [ ] Implementar gradiente de cores correto
- [ ] Adicionar sublinhado em 4 camadas
- [ ] Testar responsividade mobile/desktop
- [ ] Verificar animação de entrada (1.2s)
- [ ] Validar espaçamentos (pb-4, p-4, gap-4)
- [ ] Confirmar efeito de vidro (glass morphism)
- [ ] Testar performance das animações

## <¯ Resultado Final

O header padronizado oferece:

( **Animação suave** de blur-in em 1.2s  
< **Gradiente elegante** vermelho-amarelo  
=Ž **Efeito de vidro** com backdrop-blur  
=Ð **Sublinhado multicamada** sofisticado  
=ñ **Layout totalmente responsivo**  
¡ **Performance otimizada** com GPU  

---

**=Ý Nota**: Esta padronização garante consistência visual em todo o sistema Adega Manager, mantendo a identidade da marca e oferecendo uma experiência de usuário premium e profissional.