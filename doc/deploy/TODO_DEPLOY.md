# ✅ TODO List - Deploy Produção Adega Manager

**Objetivo:** Preparar sistema para deploy seguro no Vercel  
**Tempo Estimado Total:** 2h45min  
**Data Limite:** 27 de agosto de 2025  

---

## 🚀 FASE 1: Correções Críticas (2 horas)

### 🔴 **PRIORIDADE MÁXIMA - Parsing Errors (30 minutos)**

#### ✅ **Task 1.1: Corrigir enhanced-test-utils.tsx**
**Erro:** `',' expected` na linha 244  
**Localização:** `/src/__tests__/utils/enhanced-test-utils.tsx:244`

**Ações:**
- [ ] Abrir arquivo `/src/__tests__/utils/enhanced-test-utils.tsx`
- [ ] Localizar linha 244
- [ ] Corrigir syntax error (provavelmente vírgula faltando)
- [ ] Testar: `npm run build` deve passar sem erro neste arquivo
- [ ] Commit: "fix: corrige parsing error em enhanced-test-utils.tsx"

**Tempo:** 10 minutos

#### ✅ **Task 1.2: Corrigir PresentationTemplate.tsx**
**Erro:** `Declaration or statement expected` na linha 86  
**Localização:** `/src/shared/templates/PresentationTemplate.tsx:86`

**Ações:**
- [ ] Abrir arquivo `/src/shared/templates/PresentationTemplate.tsx`
- [ ] Localizar linha 86
- [ ] Corrigir declaração incorreta
- [ ] Validar que o componente ainda funciona
- [ ] Testar: `npm run build` deve passar sem erro neste arquivo
- [ ] Commit: "fix: corrige declaration error em PresentationTemplate.tsx"

**Tempo:** 10 minutos

#### ✅ **Task 1.3: Limpar moving-border.tsx**
**Erros:** 4 TypeScript any types  
**Localização:** `/src/components/ui/moving-border.tsx`

**Ações:**
- [ ] Abrir arquivo `/src/components/ui/moving-border.tsx`
- [ ] Substituir `any` types por tipos apropriados:
  - Linha 24: `any` → `React.ComponentProps<'div'>`
  - Linha 26: `any` → `React.CSSProperties`
  - Linha 96: `any` → `HTMLElement`
  - Linha 101: `any` → `React.RefObject<HTMLElement>`
- [ ] Testar componente ainda funciona
- [ ] Commit: "fix: remove any types de moving-border.tsx"

**Tempo:** 10 minutos

### 🔴 **PRIORIDADE MÁXIMA - React Hooks Condicionais (30 minutos)**

#### ✅ **Task 2.1: Corrigir CustomerDetailModal.tsx**
**Erro:** 3 hooks condicionais (useMemo called conditionally)  
**Localização:** `/src/features/customers/components/CustomerDetailModal.tsx`

**Ações:**
- [ ] Abrir arquivo `CustomerDetailModal.tsx`
- [ ] Localizar linhas 108, 139, 157 com useMemo condicionais
- [ ] Refatorar para mover hooks para o topo do componente:
```typescript
// ANTES (ERRADO):
if (!customer) return null;
const memoValue = useMemo(() => {...}, []);

// DEPOIS (CORRETO):  
const memoValue = useMemo(() => {
  if (!customer) return null;
  return {...};
}, [customer]);

if (!customer) return null;
```
- [ ] Testar modal ainda funciona corretamente
- [ ] Validar: `npm run lint` não deve reportar hooks condicionais
- [ ] Commit: "fix: resolve conditional hooks em CustomerDetailModal"

**Tempo:** 30 minutos

### 🟡 **PRIORIDADE ALTA - Bundle Optimization (45 minutos)**

#### ✅ **Task 3.1: Implementar Code Splitting**
**Problema:** Main bundle muito grande (1.4MB)  
**Meta:** Reduzir para < 800KB

**Ações:**
- [ ] Abrir `vite.config.ts`
- [ ] Adicionar configuração otimizada:
```typescript
export default defineConfig({
  // ... existing config
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core essencial
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Charts heavy
          'charts': ['recharts', '@tanstack/react-table'],
          
          // UI components
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            'lucide-react'
          ],
          
          // Backend integration
          'supabase': [
            '@supabase/supabase-js',
            '@tanstack/react-query'
          ],
          
          // Utilities
          'utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'zod',
            'react-hook-form'
          ],
          
          // Animations
          'animations': [
            'framer-motion',
            'motion'
          ]
        }
      }
    }
  }
});
```
- [ ] Testar build: `npm run build`
- [ ] Verificar tamanhos dos chunks
- [ ] Meta: Nenhum chunk > 500KB
- [ ] Commit: "perf: implementa code splitting otimizado"

**Tempo:** 20 minutos

#### ✅ **Task 3.2: Lazy Loading de Rotas**
**Problema:** Todas as páginas carregam no bundle principal

**Ações:**
- [ ] Abrir `/src/app/router/AppRouter.tsx` (ou arquivo de rotas)
- [ ] Implementar lazy loading:
```typescript
import { lazy, Suspense } from 'react';

// Lazy load das páginas principais
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Sales = lazy(() => import('@/pages/Sales'));
const Inventory = lazy(() => import('@/pages/InventoryManagement'));
const Customers = lazy(() => import('@/pages/CustomersLite'));
const CrmDashboard = lazy(() => import('@/pages/CrmDashboard'));
const Delivery = lazy(() => import('@/pages/Delivery'));
const Reports = lazy(() => import('@/pages/AdvancedReports'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));

// Wrapper com Suspense
const LazyRoute = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense fallback={<div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>}>
    <Component />
  </Suspense>
);
```
- [ ] Atualizar todas as rotas para usar LazyRoute
- [ ] Testar navegação entre páginas
- [ ] Verificar loading states funcionam
- [ ] Commit: "perf: implementa lazy loading de rotas principais"

**Tempo:** 25 minutos

### 🟡 **PRIORIDADE ALTA - Linting Cleanup (15 minutos)**

#### ✅ **Task 4.1: Corrigir Warnings Críticos**
**Meta:** Reduzir warnings de 28 para < 10

**Ações:**
- [ ] Executar `npm run lint` e listar warnings
- [ ] Corrigir os 5 warnings mais críticos:
  1. **AuthContext.tsx:** Adicionar `fetchUserRole` no dependency array
  2. **sparkles-text.tsx:** Adicionar `sparklesCount` no dependency array  
  3. **useNetworkStatus.ts:** Adicionar `processQueue` no dependency array
  4. **glowing-effect.tsx:** Remover `movementDuration` desnecessário
  5. **sensitive-data.tsx:** Mover constantes para arquivo separado
- [ ] Re-executar `npm run lint`
- [ ] Meta: < 10 warnings restantes
- [ ] Commit: "fix: resolve warnings críticos de linting"

**Tempo:** 15 minutos

---

## 🚀 FASE 2: Deploy Teste (30 minutos)

### ✅ **Task 5.1: Configurar Projeto Vercel (10 minutos)**

**Ações:**
- [ ] Acessar [vercel.com](https://vercel.com)
- [ ] Conectar repositório GitHub
- [ ] Criar novo projeto: `adega-manager-teste`
- [ ] Configurar build settings:
  - Framework: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Node.js Version: `18.x`

**Environment Variables:**
- [ ] Adicionar no Vercel Dashboard:
```
VITE_SUPABASE_URL = https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1amt6dmJnbmZ6dXpsenRyemxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Njk5MzUsImV4cCI6MjA2NDA0NTkzNX0.8G-ur4VH69Bk4q71k3YlA-u6d2mWAv6tMWBb7-nsLak
NODE_ENV = production
```

**Tempo:** 10 minutos

### ✅ **Task 5.2: Deploy Inicial e Teste (20 minutos)**

**Ações:**
- [ ] Fazer push das correções para branch principal
- [ ] Trigger deploy no Vercel
- [ ] Aguardar build completar (5-10 min)
- [ ] Testar URL de produção

**Checklist de Testes Básicos:**
- [ ] **Login:** Acessar com `adm@adega.com`
- [ ] **Dashboard:** Verificar KPIs carregam
- [ ] **PDV:** Testar busca de produto
- [ ] **Clientes:** Abrir lista de clientes
- [ ] **CRM:** Acessar página individual de cliente
- [ ] **Estoque:** Verificar lista de produtos
- [ ] **Relatórios:** Abrir gráficos principais
- [ ] **Performance:** Verificar velocidade de carregamento

**Critérios de Sucesso:**
- [ ] Build deploy sem erros
- [ ] Todas as páginas carregam
- [ ] Login funciona
- [ ] Performance aceitável (< 3s primeira carga)

**Tempo:** 20 minutos

---

## 🚀 FASE 3: Deploy Produção (15 minutos)

### ✅ **Task 6.1: Review Final e Deploy (15 minutos)**

**Pre-Deploy Checklist:**
- [ ] Todos os TODOs anteriores completados
- [ ] `npm run build` executa sem erros
- [ ] `npm run lint` tem < 10 warnings
- [ ] Testes básicos passaram no ambiente teste
- [ ] Performance satisfatória

**Deploy Produção:**
- [ ] Criar projeto produção no Vercel: `adega-manager-prod`
- [ ] Usar mesmas configurações do teste
- [ ] Configurar domínio customizado (se aplicável)
- [ ] Deploy da branch principal
- [ ] Validação final com cliente

**Tempo:** 15 minutos

---

## 📋 Checklist de Validação Final

### 🔍 **Testes Funcionais Completos**

#### **Sistema de Autenticação**
- [ ] Login com credenciais admin funciona
- [ ] Logout funciona corretamente
- [ ] Redirecionamento após login correto

#### **Dashboard Principal**
- [ ] KPIs carregam com dados reais
- [ ] Gráficos renderizam corretamente  
- [ ] Navegação entre módulos funciona

#### **PDV (Vendas)**
- [ ] Busca de produtos funciona
- [ ] Adicionar produtos ao carrinho
- [ ] Seleção de cliente
- [ ] Finalização de venda
- [ ] Formas de pagamento funcionam

#### **Gestão de Clientes**
- [ ] Lista de clientes carrega
- [ ] Busca/filtro de clientes
- [ ] Página individual de cliente abre
- [ ] 8 abas da página individual funcionam
- [ ] Quick Actions (WhatsApp/Email) funcionam
- [ ] Gráficos de analytics carregam

#### **CRM Dashboard**
- [ ] 4 abas principais funcionam
- [ ] Gráficos de segmentação carregam
- [ ] Lista de aniversários funciona
- [ ] Métricas de LTV corretas

#### **Estoque**
- [ ] Lista de produtos carrega
- [ ] Filtros funcionam
- [ ] Cadastro de novo produto
- [ ] Edição de produtos
- [ ] Análise de giro funciona

#### **Relatórios**
- [ ] Gráficos de vendas por categoria
- [ ] Top 10 produtos (com nomes, não IDs)
- [ ] Formas de pagamento padronizadas
- [ ] Exportação de dados

#### **Delivery**
- [ ] Lista de entregas carrega
- [ ] Status de entregas corretos
- [ ] Atribuição de entregadores

#### **Sistema de Usuários**
- [ ] Lista de usuários
- [ ] Níveis de acesso funcionam
- [ ] Permissões por perfil corretas

### 🚀 **Testes de Performance**

#### **Métricas de Performance**
- [ ] **First Contentful Paint:** < 2s
- [ ] **Largest Contentful Paint:** < 3s
- [ ] **Cumulative Layout Shift:** < 0.1
- [ ] **Time to Interactive:** < 4s

#### **Bundle Analysis**
- [ ] Main bundle: < 800KB
- [ ] Charts bundle: < 300KB
- [ ] Total gzipped: < 600KB
- [ ] No chunks > 500KB

#### **Funcionalidade Mobile**
- [ ] Layout responsivo funciona
- [ ] Touch interactions funcionam
- [ ] Performance mobile aceitável

### 🔧 **Testes Técnicos**

#### **Build e Deploy**
- [ ] Build sem erros ou warnings críticos
- [ ] Deploy automático funciona
- [ ] Environment variables corretas
- [ ] Database connectivity funcional

#### **Error Handling**
- [ ] Página 404 funciona
- [ ] Error boundaries funcionam
- [ ] Fallbacks para dados carregam
- [ ] Mensagens de erro amigáveis

---

## 📞 Troubleshooting Guide

### 🚨 **Problemas Comuns Durante Deploy**

#### **Build Failures**
**Sintoma:** Deploy falha durante build
**Soluções:**
1. Verificar parsing errors foram corrigidos
2. Confirmar environment variables estão corretas
3. Testar `npm run build` localmente
4. Verificar Node.js version no Vercel (usar 18.x)

#### **Runtime Errors**
**Sintoma:** App quebra depois de carregar
**Soluções:**
1. Verificar browser console para errors
2. Checar Network tab para failed requests
3. Verificar Supabase connection
4. Validar RLS policies ainda funcionam

#### **Performance Issues**
**Sintoma:** App muito lento
**Soluções:**
1. Verificar bundle sizes no build
2. Implementar lazy loading se não foi feito
3. Checar Vercel Analytics para bottlenecks
4. Otimizar queries do Supabase

#### **Authentication Issues**
**Sintoma:** Login não funciona
**Soluções:**
1. Verificar VITE_SUPABASE_URL correto
2. Confirmar VITE_SUPABASE_ANON_KEY válido
3. Testar connection no browser dev tools
4. Verificar RLS policies não bloquearam access

### 📋 **Emergency Rollback Plan**

Se deploy produção falhar criticamente:

1. **Immediate Actions (< 5 min):**
   - [ ] Reverter para versão anterior no Vercel
   - [ ] Notificar cliente sobre problema temporário
   - [ ] Capturar logs de erro

2. **Investigation (< 15 min):**
   - [ ] Identificar causa raiz do problema
   - [ ] Verificar se é código ou infraestrutura
   - [ ] Priorizar fix mais rápido

3. **Resolution (< 30 min):**
   - [ ] Implementar fix crítico
   - [ ] Testar fix em ambiente local
   - [ ] Re-deploy com correção
   - [ ] Validar funcionamento

4. **Post-Incident (< 60 min):**
   - [ ] Documentar causa e solução
   - [ ] Atualizar este TODO list
   - [ ] Implementar prevenção para futuro

---

## ✅ Definition of Done

### 🎯 **Critérios de Sucesso para Deploy**

Um deploy é considerado **COMPLETO** quando:

#### **Funcionalidade** ✅
- [ ] Todas as 8 páginas principais funcionam
- [ ] Login/logout funciona
- [ ] CRUD operations funcionam
- [ ] Dados reais carregam corretamente

#### **Performance** ⚡
- [ ] Loading < 3s em conexão normal
- [ ] Navegação fluida entre páginas
- [ ] Gráficos renderizam rapidamente
- [ ] Mobile experience aceitável

#### **Qualidade** 🔧
- [ ] Zero parsing errors
- [ ] Zero hooks condicionais
- [ ] < 10 linting warnings
- [ ] Bundle optimizado

#### **Validação** ✔️
- [ ] Cliente consegue logar
- [ ] Cliente consegue fazer venda teste
- [ ] Cliente consegue ver relatórios
- [ ] Sistema estável por 24h

#### **Documentação** 📚
- [ ] URL de produção documentada
- [ ] Credenciais entregues ao cliente
- [ ] Manual de uso atualizado
- [ ] Suporte configurado

---

## 📈 Success Metrics

### 🎯 **Métricas de Sucesso do Deploy**

**Technical Metrics:**
- Build time: < 2 minutos
- Bundle size reduction: > 30%
- Error rate: < 1%
- Uptime: > 99%

**User Experience:**
- Page load: < 3 segundos
- Time to interactive: < 4 segundos  
- Cliente satisfaction: Positivo
- No critical bugs: 24h

**Business Impact:**
- Cliente pode usar sistema imediatamente
- Todas as funcionalidades operacionais
- Dados preservados e seguros
- Produtividade mantida ou melhorada

---

## 📅 Timeline Detalhado

```mermaid
gantt
    title Deploy Timeline - Adega Manager
    dateFormat  HH:mm
    axisFormat  %H:%M

    section Correções
    Parsing Errors        :a1, 00:00, 30m
    Hooks Condicionais    :a2, 00:30, 30m
    Bundle Optimization   :a3, 01:00, 45m
    Linting Cleanup       :a4, 01:45, 15m

    section Deploy Teste
    Configurar Vercel     :b1, 02:00, 10m
    Deploy e Teste        :b2, 02:10, 20m

    section Deploy Prod
    Review e Deploy       :c1, 02:30, 15m
```

**Total: 2h45min from start to production**

---

*TODO List criado em 27/08/2025 - Pronto para execução imediata*