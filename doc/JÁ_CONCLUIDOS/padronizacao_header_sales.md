# Padroniza��o Header - Sistema Adega Manager

> **Documenta��o completa para padroniza��o de headers em todas as p�ginas do sistema**

## =� Vis�o Geral

Esta documenta��o define o padr�o visual e t�cnico para headers de p�ginas no Adega Manager, baseado na implementa��o da p�gina de vendas (SalesPage). O objetivo � garantir consist�ncia visual e UX em todo o sistema.

## <� Padr�o Visual Estabelecido

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
            {/* Conte�do do header aqui */}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## <� Especifica��es T�cnicas

### **1. Medidas e Espa�amentos**

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
.flex-shrink-0 // N�o diminui quando h� overflow

// T�tulo - altura do sublinhado
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

#### **Aplica��o das Cores**
```tsx
// Background do container
bg-black/20 backdrop-blur-sm border border-white/10

// Gradiente do glow background
bg-gradient-to-r from-[#FF2400]/5 via-[#FFDA04]/10 to-[#FF2400]/5

// Gradiente do texto
text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]
```

### **3. Anima��es de Entrada**

#### **Componente BlurIn - Anima��o Principal**
```tsx
<BlurIn
  word="SEU T�TULO AQUI"
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

#### **Par�metros da Anima��o**
- **Dura��o**: 1.2 segundos
- **Efeito inicial**: Blur 15px + Opacidade 0  
- **Efeito final**: Blur 0px + Opacidade 1
- **Tipo**: Smooth transition com Framer Motion

### **4. Efeito de Sublinhado Animado**

#### **Estrutura HTML**
```tsx
<div className="w-full h-6 relative mt-2">
  {/* Camada 1: Vermelho com blur */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
  
  {/* Camada 2: Vermelho s�lido */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
  
  {/* Camada 3: Amarelo com blur (menor largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
  
  {/* Camada 4: Amarelo s�lido (menor largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
</div>
```

#### **Especifica��es do Sublinhado**
- **Altura total**: 24px (h-6)
- **Camadas**: 4 layers sobrepostas
- **Gradiente**: From transparent � cor � transparent
- **Larguras**: Full width (vermelho) + 75% width (amarelo)
- **Espessuras**: 1px s�lido + 2-3px blur

## <� Implementa��o por Tipo de P�gina

### **Template Base para Qualquer P�gina**

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
                  {/* T�tulo animado */}
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
              
              {/* Slot para bot�es adicionais (opcional) */}
              {/* Adicionar elementos espec�ficos da p�gina aqui */}
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Conte�do da p�gina */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Conte�do espec�fico da p�gina */}
      </div>
    </div>
  );
}

export { PageHeader };
```

## =� Exemplos de Aplica��o

### **1. P�gina de Invent�rio**
```tsx
<PageHeader title="GEST�O DE ESTOQUE" variant="premium" />
```

### **2. P�gina de Clientes (CRM)**  
```tsx
<PageHeader title="GEST�O DE CLIENTES" variant="premium" />
```

### **3. P�gina de Entregas**
```tsx
<PageHeader title="CONTROLE DE ENTREGAS" variant="premium" />
```

### **4. Dashboard**
```tsx
<PageHeader title="PAINEL EXECUTIVO" variant="premium" />
```

## <� Varia��es de Estilo

### **Variants Dispon�veis**
- **`default`**: Cores padr�o do sistema
- **`premium`**: Gradiente vermelho-amarelo (recomendado)
- **`subtle`**: Vers�o mais sutil das cores
- **`strong`**: Cores mais vibrantes
- **`yellow`**: Predomin�ncia amarela

## =� Responsividade

### **Mobile (< 640px)**
- T�tulo centralizado: `text-center`
- Layout em coluna: `flex-col`
- Tamanho do texto: `text-xl`

### **Desktop (e 640px)**
- T�tulo alinhado � esquerda: `sm:text-left`
- Layout em linha: `sm:flex-row`
- Tamanho do texto: `lg:text-2xl`

## � Performance

### **Otimiza��es Aplicadas**
- **Backdrop blur**: Efeito de vidro sem impacto na performance
- **CSS Transforms**: Anima��es via GPU
- **Lazy loading**: Componentes carregados sob demanda
- **Memo**: React.memo aplicado onde necess�rio

## =' Depend�ncias Necess�rias

### **Componentes**
```bash
# Componente de anima��o
@/components/ui/blur-in

# Utilit�rios
@/core/config/utils (cn function)
@/core/config/theme-utils (getGlassCardClasses)

# Framer Motion (j� instalado)
framer-motion
```

### **Importa��es Padr�o**
```tsx
import { BlurIn } from "@/components/ui/blur-in";
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
```

##  Checklist de Implementa��o

Para aplicar este padr�o em uma nova p�gina:

- [ ] Importar componentes necess�rios
- [ ] Aplicar estrutura base do layout
- [ ] Configurar t�tulo da p�gina com BlurIn
- [ ] Implementar gradiente de cores correto
- [ ] Adicionar sublinhado em 4 camadas
- [ ] Testar responsividade mobile/desktop
- [ ] Verificar anima��o de entrada (1.2s)
- [ ] Validar espa�amentos (pb-4, p-4, gap-4)
- [ ] Confirmar efeito de vidro (glass morphism)
- [ ] Testar performance das anima��es

## <� Resultado Final

O header padronizado oferece:

( **Anima��o suave** de blur-in em 1.2s  
< **Gradiente elegante** vermelho-amarelo  
=� **Efeito de vidro** com backdrop-blur  
=� **Sublinhado multicamada** sofisticado  
=� **Layout totalmente responsivo**  
� **Performance otimizada** com GPU  

---

**=� Nota**: Esta padroniza��o garante consist�ncia visual em todo o sistema Adega Manager, mantendo a identidade da marca e oferecendo uma experi�ncia de usu�rio premium e profissional.