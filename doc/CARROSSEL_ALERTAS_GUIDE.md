# Sistema de Carrossel para Alertas

## 📋 Visão Geral

Implementação de um sistema elegante de carrossel/slide para exibição de múltiplos alertas no dashboard, oferecendo uma experiência de usuário moderna e interativa quando há várias notificações do sistema.

## 🎯 Problema Resolvido

Quando o sistema possui múltiplos alertas simultâneos, a exibição em lista tradicional pode:
- Ocupar muito espaço vertical
- Dificultar a visualização de alertas importantes
- Criar poluição visual no dashboard
- Não destacar adequadamente cada alerta individual

## 🚀 Solução Implementada

### Componente AlertsCarousel

**Localização:** `/src/features/dashboard/components/AlertsCarousel.tsx`

**Características:**
- **Navegação automática** com intervalo configurável
- **Controles manuais** para navegação (anterior/próximo)
- **Indicadores visuais** (dots coloridos por severidade)
- **Pause on hover** - pausa a rotação automática ao passar o mouse
- **Progress bar animada** mostrando o tempo restante para próximo slide
- **Transições suaves** com animações CSS
- **Responsivo** e otimizado para diferentes tamanhos de tela

## 🎨 Interface e Funcionalidades

### Elementos Visuais

```typescript
// Configuração de severidade com cores específicas
const severityConfig = {
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle
  },
  warning: {
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle
  },
  info: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    icon: Info
  }
}
```

### Controles de Navegação

1. **⏸️ Play/Pause Button** - Liga/desliga rotação automática
2. **◀️ Previous Button** - Navega para alerta anterior
3. **▶️ Next Button** - Navega para próximo alerta
4. **🔵 Dots Indicators** - Mostra posição atual e permite salto direto
5. **📊 Progress Bar** - Indica tempo restante para próximo slide

### Animações e Transições

- **Slide Effect:** `transform: translateX()` com `transition-transform duration-500`
- **Hover Effects:** `hover:scale-[1.02]` nos alertas
- **Pulse Animation:** Para alertas críticos
- **Progress Bar:** Animação linear CSS customizada

## ⚙️ Configuração e Props

```typescript
interface AlertsCarouselProps {
  className?: string;
  cardHeight?: number;
  autoRotateInterval?: number; // default: 5000ms (5 segundos)
  showControls?: boolean;      // default: true
}
```

### Configurações Recomendadas

```typescript
// Dashboard principal
<AlertsCarousel 
  cardHeight={520}
  autoRotateInterval={6000}  // 6 segundos por slide
  showControls={true}
/>

// Sidebar ou espaços menores
<AlertsCarousel 
  autoRotateInterval={4000}  // 4 segundos (mais rápido)
  showControls={false}       // Sem controles para economizar espaço
/>
```

## 🔄 Lógica de Auto-Rotação

### Estados de Controle

```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [isAutoRotating, setIsAutoRotating] = useState(true);
const [isPaused, setIsPaused] = useState(false);
```

### Comportamento

1. **Auto-rotação ativa** por padrão
2. **Pausa automática** quando mouse entra no card
3. **Retoma automaticamente** quando mouse sai
4. **Controle manual** sobrescreve temporariamente a rotação
5. **Loop infinito** - volta ao primeiro após o último

### useEffect para Rotação

```typescript
useEffect(() => {
  if (!hasMultipleAlerts || !isAutoRotating || isPaused) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  }, autoRotateInterval);

  return () => clearInterval(interval);
}, [alerts.length, isAutoRotating, isPaused, autoRotateInterval, hasMultipleAlerts]);
```

## 🧠 SmartAlertsContainer

**Localização:** `/src/features/dashboard/components/SmartAlertsContainer.tsx`

Componente inteligente que escolhe automaticamente entre `AlertsPanel` e `AlertsCarousel` baseado no número de alertas.

### Lógica de Decisão

```typescript
const shouldUseCarousel = forceMode === 'carousel' || 
  (forceMode !== 'panel' && alertsCount >= carouselThreshold);
```

### Props de Configuração

```typescript
interface SmartAlertsContainerProps {
  carouselThreshold?: number;  // default: 2 alertas
  forceMode?: 'panel' | 'carousel';  // força um modo específico
  // ... outras props dos componentes filhos
}
```

### Exemplo de Uso

```typescript
// Automático - usa carrossel se >= 2 alertas
<SmartAlertsContainer cardHeight={520} />

// Força carrossel sempre
<SmartAlertsContainer forceMode="carousel" />

// Usa carrossel apenas com 3+ alertas
<SmartAlertsContainer carouselThreshold={3} />
```

## 📱 Responsividade

### Breakpoints Considerados

- **Mobile:** Controles menores, auto-rotação mais lenta
- **Tablet:** Layout otimizado para toque
- **Desktop:** Experiência completa com todos os controles

### Adaptações por Tela

```css
/* Exemplo de adaptações responsivas */
.carousel-controls {
  @apply hidden sm:flex; /* Oculta em mobile */
}

.alert-content {
  @apply text-sm sm:text-base; /* Texto menor em mobile */
}
```

## 🎛️ Implementação no Dashboard

### DashboardPresentation.tsx

```typescript
// Substituição do AlertsPanel tradicional
<div className="lg:col-span-4">
  <AlertsCarousel 
    cardHeight={520} 
    autoRotateInterval={6000} 
    showControls={true} 
  />
</div>
```

### Configuração Atual

- **Intervalo:** 6 segundos por slide
- **Altura:** 520px (alinha com SalesChartSection)
- **Controles:** Habilitados
- **Hover pause:** Ativo

## 🎨 Personalização Visual

### Cores por Severidade

| Severidade | Cor Principal | Background | Border |
|------------|---------------|------------|--------|
| Critical | `text-red-400` | `bg-red-500/10` | `border-red-500/30` |
| Warning | `text-amber-400` | `bg-amber-500/10` | `border-amber-500/30` |
| Info | `text-blue-400` | `bg-blue-500/10` | `border-blue-500/30` |

### Animações CSS

```css
/* Progress bar customizada */
@keyframes progressBar {
  from { width: 0%; }
  to { width: 100%; }
}

/* Slide transition */
.carousel-container {
  transition: transform 500ms ease-in-out;
}

/* Hover effects */
.alert-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 🔧 Manutenção e Extensões

### Adicionar Novos Efeitos de Transição

```typescript
// Fade effect (alternativa ao slide)
const fadeTransition = {
  opacity: index === currentIndex ? 1 : 0,
  transition: 'opacity 500ms ease-in-out'
};

// Scale effect
const scaleTransition = {
  transform: `scale(${index === currentIndex ? 1 : 0.95})`,
  opacity: index === currentIndex ? 1 : 0.7
};
```

### Personalizar Indicadores

```typescript
// Dots customizados por severidade
const CustomDot = ({ alert, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-3 h-3 rounded-full transition-all duration-300",
      isActive ? "ring-2 ring-white/50" : "",
      severityConfig[alert.severity].bgColor
    )}
  />
);
```

## 📊 Métricas e Performance

### Performance Otimizations

- **CSS Transforms:** Usa GPU acceleration para transições
- **Selective Rendering:** Apenas o alerta atual é totalmente renderizado
- **Cleanup Effects:** Remove intervals ao desmontar componente
- **Memoization:** Evita re-renders desnecessários

### Monitoramento

```typescript
// Métricas úteis para monitoramento
const alertMetrics = {
  totalAlerts: alerts.length,
  autoRotationEnabled: isAutoRotating,
  averageViewTime: autoRotateInterval,
  userInteractions: manualNavigationCount
};
```

## 🚨 Considerações Importantes

### Acessibilidade

- **Keyboard Navigation:** Suporte para Tab e Enter
- **Screen Readers:** ARIa labels apropriados
- **Focus Management:** Indicadores visuais de foco
- **Reduced Motion:** Respeita preferências do usuário

### UX Guidelines

- **Não rodar muito rápido:** Mínimo 4 segundos por slide
- **Pause on hover:** Sempre implementar
- **Indicadores claros:** Usuario deve saber quantos alertas existem
- **Escape hatch:** Sempre permitir navegação manual

## 📝 Changelog

### v1.0.0 - Implementação Inicial
- ✅ AlertsCarousel component criado
- ✅ Auto-rotação com pause on hover
- ✅ Controles manuais de navegação
- ✅ Indicadores visuais (dots)
- ✅ Progress bar animada
- ✅ SmartAlertsContainer para escolha automática
- ✅ Integração com DashboardPresentation

### Próximas Implementações
- 🔄 Gesture support para mobile (swipe)
- 🔄 Keyboard navigation completa
- 🔄 Configurações de usuário (velocidade, auto-pause)
- 🔄 Analytics de interação com alertas

---

**Última atualização:** Agosto 2025  
**Versão:** v1.0.0  
**Status:** Produção ✅