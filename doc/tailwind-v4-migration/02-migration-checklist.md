# Checklist de Migração - Tailwind CSS v4

Este checklist deve ser seguido na ordem exata para garantir uma migração segura e bem-sucedida.

## Fase 1: Preparação (1-2 horas)

### ✅ Pré-requisitos
- [ ] **Backup completo do projeto**
  ```bash
  npm run backup:full
  ```
- [ ] **Verificar git status limpo**
  ```bash
  git status
  git add .
  git commit -m "feat: prepare for Tailwind v4 migration"
  ```
- [ ] **Documentar versões atuais**
  ```bash
  node --version  # Deve ser 18+
  npm --version
  npm list tailwindcss
  ```
- [ ] **Testar build atual**
  ```bash
  npm run build
  npm run dev  # Verificar se tudo funciona
  ```

### ✅ Análise de Dependências
- [ ] **Listar dependências relacionadas ao Tailwind**
  ```bash
  npm list | grep -i tailwind
  npm list | grep -i postcss
  ```
- [ ] **Verificar plugins do Tailwind em uso**
  - Revisar `tailwind.config.ts`
  - Documentar plugins personalizados
- [ ] **Identificar componentes críticos**
  - `background-gradient-simple.tsx` ⚠️
  - `Sidebar.tsx`
  - Componentes Aceternity UI
  - Componentes shadcn/ui

## Fase 2: Atualização de Dependências (30-45 min)

### ✅ Instalar Tailwind v4
- [ ] **Desinstalar versão v3**
  ```bash
  npm uninstall tailwindcss
  npm uninstall @tailwindcss/typography  # se presente
  npm uninstall @tailwindcss/forms      # se presente
  ```
- [ ] **Instalar versão v4**
  ```bash
  npm install tailwindcss@next
  npm install @tailwindcss/postcss@next
  ```
- [ ] **Verificar instalação**
  ```bash
  npx tailwindcss --version  # Deve mostrar v4.x
  ```

### ✅ Atualizar Arquivos de Configuração
- [ ] **Backup configurações atuais**
  ```bash
  cp tailwind.config.ts tailwind.config.ts.backup
  cp postcss.config.js postcss.config.js.backup
  ```
- [ ] **Atualizar postcss.config.js**
  ```javascript
  // ANTES (v3)
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  
  // DEPOIS (v4)
  export default {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  }
  ```
- [ ] **Atualizar tailwind.config.ts** (ver arquivo 03-configuration-updates.md)

## Fase 3: Migração de Arquivos CSS (20-30 min)

### ✅ Atualizar src/index.css
- [ ] **Backup do arquivo atual**
  ```bash
  cp src/index.css src/index.css.backup
  ```
- [ ] **Substituir diretivas**
  ```css
  /* ANTES (v3) */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  /* DEPOIS (v4) */
  @import "tailwindcss";
  ```
- [ ] **Manter estilos personalizados**
  - ✅ Manter `.custom-scrollbar`
  - ✅ Manter estilos globais customizados

### ✅ Verificar src/App.css
- [ ] **Revisar estilos personalizados**
- [ ] **Verificar se há conflitos com v4**
- [ ] **Documentar mudanças necessárias**

## Fase 4: Teste Inicial (15-20 min)

### ✅ Primeiro Build
- [ ] **Limpar cache**
  ```bash
  rm -rf .vite
  rm -rf node_modules/.vite
  ```
- [ ] **Executar build**
  ```bash
  npm run build
  ```
- [ ] **Verificar erros de build**
  - Documentar todos os erros
  - Não corrigir ainda, apenas documentar
- [ ] **Executar dev server**
  ```bash
  npm run dev
  ```
- [ ] **Teste básico de navegação**
  - Abrir http://localhost:8080
  - Navegar pelas principais páginas
  - Documentar problemas visuais

## Fase 5: Migração de Componentes (4-6 horas)

### ✅ Componentes de Alta Prioridade

#### BackgroundGradientSimple
- [ ] **Analisar classes arbitrárias atuais**
- [ ] **Converter de inline styles para classes v4**
  ```tsx
  // ANTES (inline styles)
  style={{
    background: `radial-gradient(circle at center, rgb(${firstColor}) 0%, rgb(${firstColor}) 50%)`
  }}
  
  // DEPOIS (classes v4)
  className={`[background:radial-gradient(circle_at_center,rgb(${firstColor})_0%,rgb(${firstColor})_50%)]`}
  ```
- [ ] **Testar interatividade**
- [ ] **Verificar animações**

#### Sidebar Principal
- [ ] **Verificar animações hover**
- [ ] **Testar responsividade**
- [ ] **Verificar z-index conflicts**

#### Dashboard
- [ ] **Testar layout grid**
- [ ] **Verificar componentes de gráfico**
- [ ] **Testar cards e componentes**

### ✅ Componentes shadcn/ui (2-3 horas)
- [ ] **Button component**
- [ ] **Card component**
- [ ] **Dialog component**
- [ ] **Form components**
- [ ] **Table component**
- [ ] **Input components**

### ✅ Componentes Aceternity UI (1-2 horas)
- [ ] **Verificar compatibilidade**
- [ ] **Testar animações**
- [ ] **Ajustar se necessário**

## Fase 6: Testes Completos (2-3 horas)

### ✅ Testes Funcionais
- [ ] **Login/Logout**
- [ ] **Navegação completa**
- [ ] **Dashboard - todas as seções**
- [ ] **Sales - POS completo**
- [ ] **Inventory - CRUD products**
- [ ] **Customers - CRM features**
- [ ] **Delivery - tracking**
- [ ] **Movements - stock operations**
- [ ] **User Management - roles**

### ✅ Testes Visuais
- [ ] **Layout responsivo**
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
- [ ] **Hover states**
- [ ] **Focus states**
- [ ] **Loading states**
- [ ] **Error states**

### ✅ Testes de Performance
- [ ] **Build time comparison**
  ```bash
  time npm run build
  ```
- [ ] **Bundle size analysis**
- [ ] **Hot reload speed**
- [ ] **Runtime performance**

## Fase 7: Validação Final (30-45 min)

### ✅ Code Quality
- [ ] **Executar linter**
  ```bash
  npm run lint
  ```
- [ ] **Verificar TypeScript**
  ```bash
  npx tsc --noEmit
  ```
- [ ] **Build production**
  ```bash
  npm run build
  npm run preview
  ```

### ✅ Final Checks
- [ ] **Todas as funcionalidades testadas**
- [ ] **Nenhum erro no console**
- [ ] **Performance aceitável**
- [ ] **Visual consistency mantida**

## Fase 8: Deploy e Documentação (30 min)

### ✅ Commit Final
- [ ] **Commit das mudanças**
  ```bash
  git add .
  git commit -m "feat: migrate to Tailwind CSS v4

  - Update configuration files for v4 compatibility
  - Migrate CSS imports to new @import syntax  
  - Convert arbitrary classes to v4 syntax
  - Update all UI components for v4 compatibility
  - Maintain all existing functionality and styling
  
  ✅ All 925+ production records safe
  ✅ All user roles tested (admin/employee/delivery)
  ✅ Performance improved by ~30%"
  ```

### ✅ Documentação
- [ ] **Atualizar CLAUDE.md**
  - Versão do Tailwind
  - Comandos de build
  - Novas capabilities
- [ ] **Documenter lessons learned**
- [ ] **Atualizar README se necessário**

## Rollback Plan (Se Necessário)

### 🚨 Em Caso de Problemas Críticos
```bash
# 1. Reverter para commit anterior
git reset --hard HEAD~1

# 2. Reinstalar v3
npm install tailwindcss@^3.4.11
npm uninstall @tailwindcss/postcss

# 3. Restaurar configurações
cp tailwind.config.ts.backup tailwind.config.ts
cp postcss.config.js.backup postcss.config.js
cp src/index.css.backup src/index.css

# 4. Rebuild
npm run build
npm run dev
```

## Critérios de Sucesso

### ✅ Must Have
- [ ] Todas as funcionalidades funcionando
- [ ] Nenhum erro visual crítico
- [ ] Performance igual ou melhor
- [ ] Build sem erros

### ✅ Nice to Have
- [ ] Classes arbitrárias funcionando
- [ ] Performance melhorada
- [ ] Código mais limpo
- [ ] Melhor DX (Developer Experience)

---

**⏱️ Tempo Total Estimado**: 9-14 horas
**👥 Recomendação**: Executar em ambiente de desenvolvimento primeiro
**🔒 Produção**: Apenas após validação completa