# Backgrounds da Aplicação Adega Manager

## Visão Geral

A aplicação possui três backgrounds distintos implementados para diferentes contextos:

1. **Fluid Blob Background (Three.js)** - Background principal da aplicação (atual)
2. **Background Iridescente (React Bits)** - Implementação anterior (substituído)
3. **Wavy Background (Aceternity UI)** - Aplicado na tela de autenticação

---

## 1. Fluid Blob Background - Three.js (Background Principal - ATUAL)

### Localização
- **Componente**: `src/components/ui/fluid-blob.tsx`
- **Aplicado em**: `src/App.tsx` (fixed position, z-index 0)
- **Status**: ✅ **ATIVO** - Background principal da aplicação

### Características
- **Three.js + React Three Fiber**: Renderização 3D de alta performance
- **WebGL Shaders**: Vertex e Fragment shaders customizados para formas fluidas
- **Raymarching**: Técnica avançada de renderização para formas orgânicas
- **Animação Contínua**: Movimento fluido e orgânico das formas blob
- **Cores**: Gradiente preto para branco brilhante (substituiu purple/gold)
- **Transparência**: Alpha 0.8 com MultiplyBlending para contraste

### Dependências
```json
{
  "@react-three/fiber": "^8.17.10",
  "three": "^0.169.0"
}
```

### Configuração Atual
```tsx
<LavaLamp />
```

### Implementação no App.tsx
```tsx
<div className="fixed inset-0 z-0">
  <LavaLamp />
</div>
```

### ⚠️ CONFIGURAÇÕES CRÍTICAS - NÃO ALTERAR SEM CUIDADO

#### Fragment Shader - Cores
```glsl
// ✅ CONFIGURAÇÃO ATUAL - PRETO PARA BRANCO
vec3 fluidColor = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), fresnel);
gl_FragColor = vec4(fluidColor, 0.8);
```

#### Material Settings
```tsx
<shaderMaterial
  uniforms={uniforms}
  vertexShader={vertexShader}
  fragmentShader={fragmentShader}
  transparent={true}
  blending={THREE.MultiplyBlending}  // ✅ CRÍTICO: NÃO usar NormalBlending
  depthWrite={false}
/>
```

#### Canvas Settings
```tsx
<Canvas
  orthographic
  gl={{ antialias: true }}  // ✅ Sem alpha/premultipliedAlpha
>
```

### 🔧 TROUBLESHOOTING - PROBLEMAS COMUNS

#### ❌ Problema: Fluidos aparecem cinza
**Causa**: NormalBlending + baixo alpha mistura com fundo branco
**Solução**: 
```tsx
blending={THREE.MultiplyBlending}  // EM VEZ DE NormalBlending
gl_FragColor = vec4(fluidColor, 0.8);  // Alpha alto (0.8)
```

#### ❌ Problema: Animação parou de funcionar
**Causa**: useFrame não está atualizando uniforms.time
**Verificar**:
```tsx
useFrame((state) => {
  if (meshRef.current) {
    uniforms.time.value = state.clock.elapsedTime;  // ✅ Deve estar presente
  }
});
```

#### ❌ Problema: Performance baixa
**Causa**: Raymarching muito complexo ou resolução alta
**Solução**: Manter configuração atual (otimizada)

---

## 2. Background Iridescente - React Bits (SUBSTITUÍDO)

### ⚠️ STATUS: DESABILITADO
- **Componente**: `src/components/ui/iridescence.jsx` (ainda presente)
- **CSS**: `src/components/ui/iridescence.css` (ainda presente)
- **Wrapper**: `src/components/ui/background-wrapper.tsx` (ainda presente)
- **Status**: 🔴 **INATIVO** - Substituído pelo Fluid Blob Background

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

## 3. Wavy Background - Aceternity UI (Tela de Login - ATIVO)

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

### App.tsx - Controle Global (ATUAL)
```tsx
<div className="min-h-screen w-full relative">
  {/* Background fluid blob - SEMPRE ATIVO */}
  <div className="fixed inset-0 z-0">
    <LavaLamp />
  </div>
  
  <div className="relative z-10">
    <Routes>
      <Route path="/auth" element={<Auth />} />  {/* COM Wavy Background */}
      <Route path="/" element={<Index />} />     {/* COM Fluid Blob */}
    </Routes>
  </div>
</div>
```

### Fluxo de Backgrounds (ATUAL)
1. **Usuário não logado** → Acessa `/auth` → **Wavy Background** (sobrepõe Fluid Blob)
2. **Login bem-sucedido** → Redirecionado para `/` → **Fluid Blob Background**
3. **Logout** → Volta para `/auth` → **Wavy Background** (sobrepõe Fluid Blob)

---

## Performance e Otimizações

### Fluid Blob Background (Three.js) - ATUAL
- ✅ WebGL com Three.js (GPU accelerated)
- ✅ React Three Fiber para otimização React
- ✅ Raymarching otimizado (100 iterações máx)
- ✅ useFrame para animação smooth (60fps)
- ✅ Orthographic camera para performance
- ✅ Cleanup automático de recursos Three.js

### Wavy Background (Aceternity UI) - ATIVO
- ✅ Canvas otimizado com requestAnimationFrame
- ✅ Window resize listener para responsividade
- ✅ Noise algorithm otimizado (Simplex)
- ✅ Filtros CSS para Safari compatibility

### Background Iridescente (React Bits) - DESABILITADO
- 🔴 INATIVO - Recursos não utilizados mas ainda presentes

---

## Personalização

### Para ajustar o Fluid Blob Background (ATUAL):
```glsl
// ⚠️ CUIDADO: Apenas modificar se necessário
// Em fluid-blob.tsx - Fragment Shader

// Cores (preto para branco)
vec3 fluidColor = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), fresnel);

// Transparência e blending
gl_FragColor = vec4(fluidColor, 0.8);  // Alpha: 0.1-1.0
blending={THREE.MultiplyBlending}       // ✅ NÃO alterar

// Velocidade da animação (nos uniforms)
time/5.0   // Mais lento
time/3.0   // Mais rápido
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

### ✅ Completo - ATUAL (Agosto 2025)
- [x] **Fluid Blob Background (Three.js)** - Implementado e ativo
- [x] **Wavy Background (Aceternity UI)** - Implementado e ativo
- [x] **Background Iridescente (React Bits)** - Substituído mas preservado
- [x] Dependências Three.js e React Three Fiber instaladas
- [x] Build de produção validado
- [x] Performance otimizada (GPU acceleration)
- [x] Troubleshooting documentado

### 🎯 Funcionamento Atual (AGOSTO 2025)
- **Tela de Login**: Wavy Background com ondas fluidas coloridas (sobrepõe Fluid Blob)
- **Aplicação Principal**: **Fluid Blob Background** com formas pretas/brancas fluidas
- **Background**: Fluid Blob sempre ativo (fixed position, z-index 0)
- **Animação**: Contínua e suave com raymarching otimizado

### 🔄 Histórico de Mudanças
- **Julho 2025**: Background Iridescente (React Bits) implementado
- **Agosto 2025**: **Fluid Blob Background (Three.js) implementado e ativado**
- **Status**: Fluid Blob é o background principal atual