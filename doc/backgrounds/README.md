# Backgrounds da Aplicação Adega Manager

## Visão Geral

A aplicação possui dois backgrounds distintos implementados para diferentes contextos:

1. **Background Iridescente (React Bits)** - Aplicado após o login
2. **Wavy Background (Aceternity UI)** - Aplicado na tela de autenticação

---

## 1. Background Iridescente - React Bits (Pós-Login)

### Localização
- **Componente**: `src/components/ui/iridescence.jsx`
- **CSS**: `src/components/ui/iridescence.css` 
- **Wrapper**: `src/components/ui/background-wrapper.tsx`
- **Aplicado em**: `src/App.tsx`

### Características
- **WebGL Shaders**: Renderização de alta performance usando OGL
- **Reação ao Mouse**: Background responde ao movimento do cursor
- **Cores**: Configurado com tons roxo/azul elegantes (0.6, 0.4, 1.0)
- **Velocidade**: Speed 0.8 para movimento suave
- **Amplitude**: 0.15 para reação moderada ao mouse

### Dependências
```json
{
  "ogl": "^1.0.11"
}
```

### Configuração Atual
```jsx
<Iridescence 
  color={[0.6, 0.4, 1.0]}  // Cor roxa/azul elegante
  speed={0.8}              // Velocidade moderada
  amplitude={0.15}         // Amplitude para reação ao mouse
  mouseReact={true}        // Habilita reação ao mouse
/>
```

### Ativação Condicional
O background só é exibido quando `user` está presente no contexto de autenticação:

```tsx
const { user } = useAuth();
if (!user) {
  return <>{children}</>;
}
```

---

## 2. Wavy Background - Aceternity UI (Tela de Login)

### Localização
- **Componente**: `src/components/ui/wavy-background.tsx`
- **Aplicado em**: `src/pages/Auth.tsx`

### Características
- **Canvas Animation**: Usa HTML5 Canvas para renderização
- **Noise Algorithm**: Implementa Simplex Noise para movimento orgânico
- **Ondas Fluidas**: 5 ondas com cores gradientes
- **Responsivo**: Adapta-se automaticamente ao tamanho da tela
- **Compatibilidade Safari**: Filtros específicos para Safari

### Dependências
```json
{
  "simplex-noise": "^4.0.3"
}
```

### Configuração Atual
```jsx
<WavyBackground 
  className="flex items-center justify-center"
  colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
  waveWidth={50}
  backgroundFill="rgb(15, 23, 42)"
  blur={10}
  speed="slow"
  waveOpacity={0.5}
>
```

### Cores das Ondas
- `#38bdf8` - Sky Blue
- `#818cf8` - Indigo  
- `#c084fc` - Purple
- `#e879f9` - Fuchsia
- `#22d3ee` - Cyan

---

## Estrutura de Implementação

### App.tsx - Controle Global
```tsx
<BackgroundWrapper>  {/* Iridescence apenas após login */}
  <Routes>
    <Route path="/auth" element={<Auth />} />  {/* Com Wavy Background */}
    <Route path="/" element={<Index />} />     {/* Com Iridescence */}
  </Routes>
</BackgroundWrapper>
```

### Fluxo de Backgrounds
1. **Usuário não logado** → Acessa `/auth` → **Wavy Background**
2. **Login bem-sucedido** → Redirecionado para `/` → **Iridescence Background**
3. **Logout** → Volta para `/auth` → **Wavy Background**

---

## Performance e Otimizações

### Background Iridescente (React Bits)
- ✅ WebGL renderização (GPU accelerated)
- ✅ RequestAnimationFrame para smooth animation
- ✅ Cleanup de listeners e contexto WebGL
- ✅ Responsive design automático

### Wavy Background (Aceternity UI) 
- ✅ Canvas otimizado com requestAnimationFrame
- ✅ Window resize listener para responsividade
- ✅ Noise algorithm otimizado (Simplex)
- ✅ Filtros CSS para Safari compatibility

---

## Personalização

### Para ajustar o Background Iridescente:
```jsx
// Em background-wrapper.tsx
<Iridescence 
  color={[r, g, b]}      // Valores 0-1 para RGB
  speed={0.1-2.0}        // Velocidade da animação
  amplitude={0.1-0.5}    // Intensidade da reação ao mouse
  mouseReact={boolean}   // Habilitar/desabilitar reação
/>
```

### Para ajustar o Wavy Background:
```jsx
// Em Auth.tsx
<WavyBackground 
  colors={["#hex1", "#hex2", ...]}  // Array de cores hexadecimais
  waveWidth={10-100}                // Largura das ondas
  blur={0-20}                       // Intensidade do blur
  speed={"slow"|"fast"}             // Velocidade da animação
  waveOpacity={0.1-1.0}            // Opacidade das ondas
/>
```

---

## Status de Implementação

### ✅ Completo
- [x] Background Iridescente (React Bits) implementado
- [x] Wavy Background (Aceternity UI) implementado  
- [x] Controle condicional por estado de autenticação
- [x] Dependências instaladas e funcionando
- [x] Build de produção validado
- [x] Performance otimizada

### 🎯 Funcionamento Atual
- **Tela de Login**: Wavy Background com ondas fluidas coloridas
- **Aplicação Principal**: Background Iridescente com WebGL e reação ao mouse
- **Transição**: Automática baseada no estado de autenticação do usuário