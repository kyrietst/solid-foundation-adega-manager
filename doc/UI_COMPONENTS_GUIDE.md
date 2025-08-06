# Guia de Componentes UI - Adega Manager

## Visão Geral

Este documento fornece orientações detalhadas para trabalhar com os componentes UI da aplicação, incluindo sidebar, fluid blob background, e outros elementos visuais avançados.

---

## Sidebar - Navegação Principal

### Localização
- **Componente**: `src/app/layout/Sidebar.tsx`
- **Base UI**: `src/shared/ui/primitives/` (Aceternity UI + Shadcn)
- **Status**: ✅ **ATIVO** - Navegação principal da aplicação

### Características
- **Framework**: Aceternity UI com animações avançadas
- **Responsividade**: Adaptação automática mobile/desktop
- **Animações**: Hover effects, transitions suaves
- **Role-based**: Filtros baseados em permissões do usuário
- **Estado**: Expansível/colapsível com ícones dinâmicos

### ⚠️ CONFIGURAÇÕES CRÍTICAS

#### Z-Index Configuration
```tsx
// ✅ SIDEBAR sempre acima do Fluid Blob
<div className="fixed left-0 top-0 h-full z-20"> {/* z-index 20 */}
  <Sidebar />
</div>

// ✅ FLUID BLOB sempre no fundo
<div className="fixed inset-0 z-0"> {/* z-index 0 */}
  <LavaLamp />
</div>

// ✅ CONTEÚDO PRINCIPAL no meio
<div className="relative z-10"> {/* z-index 10 */}
  <Routes />
</div>
```

#### Problemas Comuns e Soluções

##### ❌ Problema: Sidebar desaparece atrás do background
**Causa**: Z-index incorreto ou conflito de positioning
**Solução**:
```tsx
// Verificar hierarquia de z-index
sidebar: z-20 (mais alto)
content: z-10 (meio)
background: z-0 (mais baixo)
```

##### ❌ Problema: Animações da sidebar não funcionam
**Causa**: CSS conflitos ou Aceternity UI não carregado
**Verificar**:
```tsx
// Verificar imports Aceternity UI
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"

// Verificar se está dentro do provider
<SidebarProvider>
  <Sidebar />
</SidebarProvider>
```

##### ❌ Problema: Sidebar não responde no mobile
**Causa**: Touch events não configurados ou CSS responsivo
**Solução**:
```tsx
// Verificar classes Tailwind responsivas
className="md:w-64 w-16 transition-all"
```

---

## Fluid Blob Background - Sistema 3D

### Localização
- **Componente**: `src/components/ui/fluid-blob.tsx`
- **Tecnologia**: Three.js + React Three Fiber
- **Status**: ✅ **ATIVO** - Background principal

### Arquitetura Técnica

#### Fragment Shader (WebGL)
```glsl
// ✅ CONFIGURAÇÃO TESTADA E FUNCIONAL
void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec3 cameraPos = vec3(0.0, 0.0, 5.0);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * resolution.zw, -1));
    
    float t = rayMarch(cameraPos, ray);
    if (t > 0.0) {
        vec3 p = cameraPos + ray * t;
        vec3 normal = getNormal(p);
        float fresnel = pow(1.0 + dot(ray, normal), 3.0);
        
        // CORES: Preto para branco
        vec3 fluidColor = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), fresnel);
        
        // ALPHA: 0.8 para visibilidade ideal
        gl_FragColor = vec4(fluidColor, 0.8);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.05);
    }
}
```

#### Material Configuration
```tsx
// ✅ CONFIGURAÇÃO CRÍTICA - NÃO ALTERAR
<shaderMaterial
  uniforms={uniforms}
  vertexShader={vertexShader}
  fragmentShader={fragmentShader}
  transparent={true}
  blending={THREE.MultiplyBlending}  // CRÍTICO: MultiplyBlending
  depthWrite={false}
/>
```

#### Animation System
```tsx
// ✅ SISTEMA DE ANIMAÇÃO
useFrame((state) => {
  if (meshRef.current) {
    // TEMPO GLOBAL para animação contínua
    uniforms.time.value = state.clock.elapsedTime;
  }
});

// Rotações das esferas no shader
vec3 p1 = rotate(p, vec3(0.0, 0.0, 1.0), time/5.0);  // Velocidade 1
vec3 p2 = rotate(p, vec3(1.), -time/5.0);             // Velocidade 1
vec3 p3 = rotate(p, vec3(1., 1., 0.), -time/4.5);     // Velocidade 2
vec3 p4 = rotate(p, vec3(0., 1., 0.), -time/4.0);     // Velocidade 3
```

### 🔧 TROUBLESHOOTING - Fluid Blob

#### ❌ Fluidos aparecem cinza/transparentes
**Diagnóstico**:
1. Verificar blending mode
2. Verificar alpha value
3. Verificar z-index hierarchy

**Solução**:
```tsx
// 1. BLENDING CORRETO
blending={THREE.MultiplyBlending}  // NÃO usar NormalBlending

// 2. ALPHA ALTO
gl_FragColor = vec4(fluidColor, 0.8);  // NÃO usar < 0.5

// 3. Z-INDEX BAIXO
<div className="fixed inset-0 z-0">  // NÃO usar z-index alto
```

#### ❌ Animação parou/está lenta
**Diagnóstico**:
1. Verificar useFrame callback
2. Verificar time uniform
3. Verificar performance do raymarching

**Solução**:
```tsx
// 1. USEFRAME ATIVO
useFrame((state) => {
  if (meshRef.current) {
    uniforms.time.value = state.clock.elapsedTime; // ✅ Sempre atualizar
  }
});

// 2. PERFORMANCE RAYMARCHING
for (int i = 0; i < 100; i++) {  // ✅ Máximo 100 iterações
  // ... raymarching logic
  if (t > 100.0) break;  // ✅ Break para evitar loops infinitos
}
```

#### ❌ Performance baixa/travamentos
**Diagnóstico**:
1. GPU não suporta WebGL complexo
2. Muitas iterações no raymarching
3. Resolução muito alta

**Solução**:
```tsx
// 1. REDUZIR ITERAÇÕES (se necessário)
for (int i = 0; i < 50; i++) {  // Reduzir de 100 para 50

// 2. SIMPLIFICAR GEOMETRIA (se necessário)
// Remover algumas esferas do SDF

// 3. ADICIONAR FALLBACK
const [webglSupported, setWebglSupported] = useState(true);

useEffect(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  setWebglSupported(!!gl);
}, []);

return webglSupported ? <LavaLamp /> : <div className="bg-gray-900" />;
```

---

## Aceternity UI Components

### Sistema de Componentes
- **Base**: Radix UI primitives
- **Styling**: Tailwind CSS com classes customizadas
- **Animações**: Framer Motion integration
- **Theme**: Adega Wine Cellar palette

### Componentes Disponíveis
```tsx
// Navegação
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"

// Layout
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Forms
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

// Feedback
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Background/Effects
import { WavyBackground } from "@/components/ui/wavy-background"
import { LavaLamp } from "@/components/ui/fluid-blob"
```

### ⚠️ REGRAS DE USO

#### Hierarquia de Importação
1. **Aceternity UI** (primeiro) - Componentes com animações
2. **Shadcn/ui** (segundo) - Componentes base/primitivos
3. **Custom components** (terceiro) - Componentes específicos

#### Z-Index Strategy
```css
/* Hierarquia fixa - NÃO alterar */
.sidebar { z-index: 20; }      /* Navegação sempre no topo */
.modals { z-index: 50; }       /* Modais acima de tudo */
.content { z-index: 10; }      /* Conteúdo no meio */
.background { z-index: 0; }    /* Background no fundo */
```

---

## Padrões de Development

### Ao Adicionar Novos Componentes UI

1. **Verificar Aceternity UI primeiro**
   ```bash
   # Usar MCP tool se disponível
   npx aceternity-ui add component-name
   ```

2. **Manter hierarquia de z-index**
   ```tsx
   // Sempre verificar z-index conflicts
   className="relative z-10"  // Para conteúdo
   className="fixed z-20"     // Para navegação
   className="absolute z-0"   // Para backgrounds
   ```

3. **Testar com Fluid Blob ativo**
   ```tsx
   // Sempre testar com background ativo
   // Verificar sobreposições visuais
   // Confirmar que animações não conflitam
   ```

### Ao Modificar Sidebar

1. **Preservar estrutura Aceternity**
   ```tsx
   // Não quebrar SidebarProvider
   <SidebarProvider>
     <Sidebar>
       {/* Modificações aqui */}
     </Sidebar>
   </SidebarProvider>
   ```

2. **Manter responsividade**
   ```tsx
   // Classes Tailwind responsivas obrigatórias
   className="md:w-64 w-16 transition-all duration-300"
   ```

3. **Preservar role-based filtering**
   ```tsx
   // Manter lógica de permissões
   {user.role === 'admin' && <AdminMenuItem />}
   ```

---

## Status e Histórico

### ✅ Implementado (Agosto 2025)
- [x] Fluid Blob Background (Three.js) - Background principal
- [x] Sidebar (Aceternity UI) - Navegação responsiva
- [x] Z-index hierarchy - Sem conflitos visuais
- [x] Troubleshooting guide - Problemas documentados
- [x] Performance optimization - GPU acceleration

### 🎯 Funcionamento Atual
- **Background**: Fluid Blob sempre ativo (z-index 0)
- **Navegação**: Sidebar Aceternity UI (z-index 20)
- **Conteúdo**: App content (z-index 10)
- **Animações**: Smooth e sem conflitos
- **Performance**: Otimizada para produção

### 📝 Notas para Desenvolvedores
1. **NUNCA alterar z-index hierarchy** sem documentar
2. **SEMPRE testar** novos componentes com Fluid Blob ativo
3. **MANTER** Aceternity UI patterns ao adicionar componentes
4. **VERIFICAR** responsividade em mobile/desktop
5. **DOCUMENTAR** qualquer alteração em shaders/WebGL