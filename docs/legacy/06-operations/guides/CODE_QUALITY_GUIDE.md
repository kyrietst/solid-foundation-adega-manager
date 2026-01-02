# 🎯 Code Quality Guide - Adega Manager

> Guia completo de qualidade de código, padrões ESLint e boas práticas para desenvolvimento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Padrões ESLint](#padrões-eslint)
3. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
4. [Pragmatic Suppressions](#pragmatic-suppressions)
5. [Acessibilidade](#acessibilidade)
6. [CI/CD e Automação](#cicd-e-automação)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Adega Manager mantém **zero warnings policy** para garantir código enterprise-grade. Esta política é aplicada via ESLint com configurações rigorosas.

### Métricas de Qualidade Atuais

```bash
npm run lint
✔ 0 errors
✔ 0 warnings
```

**Status**: 🟢 100% Clean Code (desde v3.3.3)

### Princípios de Qualidade

1. **Zero Tolerância para Warnings**: Todo warning deve ser corrigido
2. **Pragmatic Suppressions**: Usar `eslint-disable` quando justificável
3. **Documentação Inline**: Todo suppression deve ter comentário explicativo
4. **Acessibilidade First**: Conformidade WCAG AAA
5. **Type Safety**: TypeScript strict mode onde possível

---

## ⚙️ Padrões ESLint

### Configuração do Projeto

**Arquivo**: `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  // ... configurações
}
```

### Regras Principais

#### 1. React Hooks Rules
**Plugin**: `eslint-plugin-react-hooks`

**Regras aplicadas**:
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

**Quando usar suppressions**:
```typescript
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Justificativa: Otimização de performance com closures controlados.
 * Dependências estáveis gerenciadas manualmente.
 */
const myHook = useCallback(() => {
  // Lógica com closure intencional
}, []); // Dependências vazias intencionais
```

#### 2. Accessibility Rules (jsx-a11y)
**Plugin**: `eslint-plugin-jsx-a11y`

**Regras importantes**:
- `jsx-a11y/no-autofocus`: warn
- `jsx-a11y/label-has-associated-control`: warn
- `jsx-a11y/click-events-have-key-events`: warn

**Solução preferencial**: Corrigir o código em vez de suppress

```tsx
// ❌ EVITAR
<Input autoFocus />

// ✅ PREFERIR
<Input /> // Deixar navegador gerenciar foco
```

#### 3. React Refresh Rules
**Plugin**: `eslint-plugin-react-refresh`

**Regra**: `react-refresh/only-export-components`

**Quando suppress é aceitável**:
- Arquivos de exemplo (`*.example.tsx`)
- Arquivos de utilitários com componentes (`utils.tsx`)
- Arquivos de constantes com componentes de demonstração

```typescript
/* eslint-disable react-refresh/only-export-components */
/**
 * Arquivo de exemplo com múltiplas exportações para documentação
 */
export const ExampleComponent = () => { /* ... */ };
export const EXAMPLE_CONSTANTS = { /* ... */ };
export const exampleFunction = () => { /* ... */ };
```

---

## 🔄 Workflow de Desenvolvimento

### Pre-Commit Checklist

```bash
# 1. Verificar ESLint
npm run lint

# 2. Verificar TypeScript
npx tsc --noEmit

# 3. Executar testes
npm run test:run

# 4. Build local
npm run build
```

### Git Hooks (Recomendado)

**Instalar husky**:
```bash
npm install --save-dev husky
npx husky install
```

**Configurar pre-commit hook**:
```bash
npx husky add .husky/pre-commit "npm run lint"
```

### Workflow Completo

```
┌─────────────────┐
│ Develop Feature │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm run lint   │ ◄── Zero warnings required
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm run build  │ ◄── Must succeed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Git Commit    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Push & CI/CD  │ ◄── Automated checks
└─────────────────┘
```

---

## 🛠️ Pragmatic Suppressions

### Quando Usar

Use `eslint-disable` **SOMENTE** quando:

1. ✅ **Otimização intencional**: Performance crítica com closures controlados
2. ✅ **Arquivos de exemplo**: Múltiplas exportações para documentação
3. ✅ **Animações complexas**: Refs e timers com dependências circulares
4. ✅ **Contextos globais**: Dependências estáveis gerenciadas manualmente

### Quando NÃO Usar

Nunca use suppressions para:

1. ❌ **Preguiça**: "Não quero corrigir agora"
2. ❌ **Falta de compreensão**: "Não entendo o warning"
3. ❌ **Código legado**: "Sempre foi assim"
4. ❌ **Deadline pressure**: "Preciso entregar rápido"

### Padrão de Documentação

**Template obrigatório**:
```typescript
/* eslint-disable rule-name */
/**
 * [Nome do Componente/Hook]
 *
 * Justificativa para disable:
 * - Razão técnica específica
 * - Impacto de não usar suppress
 * - Data e responsável
 *
 * @author [Seu Nome]
 * @date [YYYY-MM-DD]
 * @version [x.x.x]
 */
```

**Exemplo real**:
```typescript
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * AuthContext - Context global de autenticação
 *
 * Justificativa:
 * - useCallback com closure intencional para userRole
 * - Dependências estáveis (session) gerenciadas pelo Supabase
 * - Re-renders controlados manualmente para performance
 *
 * @author Claude Code
 * @date 2025-10-24
 * @version 3.3.3
 */
```

### Revisão de Suppressions

**Frequência**: A cada 3 meses ou major version

**Checklist**:
- [ ] Suppression ainda é necessário?
- [ ] Há nova forma de resolver sem suppress?
- [ ] Documentação está atualizada?
- [ ] Impacto em performance/acessibilidade?

---

## ♿ Acessibilidade

### WCAG Compliance

O projeto visa **WCAG AAA compliance**. ESLint ajuda a garantir isso.

### Regras Críticas

#### 1. No Autofocus
```tsx
// ❌ RUIM - Confunde screen readers
<Input autoFocus />

// ✅ BOM - Deixa usuário controlar
<Input />
```

#### 2. Labels com Controles
```tsx
// ❌ RUIM - Screen reader não associa
<label>Nome</label>
<input id="name" />

// ✅ BOM - Associação explícita
<label htmlFor="name">Nome</label>
<input id="name" />
```

#### 3. Eventos de Teclado
```tsx
// ❌ RUIM - Só funciona com mouse
<div onClick={handleClick}>Click me</div>

// ✅ BOM - Funciona com teclado
<button onClick={handleClick}>Click me</button>
```

### Teste de Acessibilidade

**Manual**:
1. Navegue site apenas com Tab
2. Use screen reader (NVDA/JAWS)
3. Teste com alto contraste
4. Verifique sem mouse

**Automatizado**:
```bash
npm run lint # Inclui jsx-a11y checks
```

---

## 🚀 CI/CD e Automação

### GitHub Actions

**Workflow atual** (`.github/workflows/quality.yml`):

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint # MUST pass with 0 warnings
      - run: npm run build
```

### Branch Protection

**Configuração recomendada**:
```
main branch:
  ✅ Require status checks to pass
  ✅ Require lint job success
  ✅ Require at least 1 approval
  ❌ Allow force push
```

### Pre-Commit Hooks

**Setup com Husky**:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:run",
      "pre-push": "npm run build"
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problema 1: "Too many warnings"

**Erro**:
```
ESLint found too many warnings (maximum: 0)
```

**Solução**:
```bash
# 1. Ver lista completa de warnings
npm run lint

# 2. Corrigir um por um ou usar auto-fix
npm run lint -- --fix

# 3. Para warnings que não podem ser auto-fixed
#    Aplicar pragmatic suppressions com documentação
```

### Problema 2: "Unused eslint-disable directive"

**Erro**:
```
error  Unused eslint-disable directive (no problems were reported)
```

**Solução**:
```typescript
// ❌ REMOVER - Disable desnecessário
/* eslint-disable rule-that-doesnt-trigger */

// ✅ MANTER - Apenas disables que realmente suprimem warnings
/* eslint-disable react-hooks/exhaustive-deps */
```

### Problema 3: Build passa local mas falha no CI

**Causas comuns**:
1. `.eslintcache` local desatualizado
2. Node/npm versions diferentes
3. Arquivos não commitados

**Solução**:
```bash
# Limpar cache
rm -rf .eslintcache node_modules
npm install

# Testar exatamente como CI
npm ci # Usa package-lock.json
npm run lint
npm run build
```

### Problema 4: Conflitos após merge

**Sintoma**: ESLint passa em branches mas falha após merge

**Solução**:
```bash
# Após merge
npm run lint -- --fix  # Auto-fix o que for possível
npm run lint           # Ver o que resta
# Corrigir manualmente os restantes
```

---

## 📊 Métricas e Monitoramento

### Dashboard de Qualidade

**Métricas importantes**:
- Número de warnings: **0 (target)**
- Cobertura de testes: **> 80%**
- Build time: **< 2 min**
- Bundle size: **< 500kb gzipped**

### Ferramentas de Monitoramento

```bash
# ESLint report
npm run lint -- --format html --output-file eslint-report.html

# Bundle analysis
npm run build -- --stats
npx vite-bundle-visualizer

# Lighthouse audit (acessibilidade)
lighthouse https://your-app.com --only-categories=accessibility
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [React Hooks Rules](https://react.dev/reference/react/hooks#rules-of-hooks)
- [jsx-a11y Plugin](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Ferramentas Úteis
- [ESLint VS Code Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://prettier.io/) - Code formatting
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Accessibility audit
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension

### Arquivos do Projeto
- `.eslintrc.cjs` - Configuração ESLint
- `tsconfig.json` - TypeScript config
- `package.json` - Scripts e dependências
- `docs/07-changelog/CODE_QUALITY_ESLINT_CLEANUP_v3.3.3.md` - Histórico v3.3.3

---

## 🎯 Checklist de Qualidade

### Para Cada PR

- [ ] `npm run lint` passa sem warnings
- [ ] `npm run build` completa com sucesso
- [ ] `npx tsc --noEmit` sem erros TypeScript
- [ ] Testes passam: `npm run test:run`
- [ ] Acessibilidade verificada manualmente
- [ ] Suppressions documentados (se houver)
- [ ] Bundle size não aumentou significativamente
- [ ] Performance não degradou

### Para Cada Release

- [ ] Todos PRs passaram no checklist acima
- [ ] Code coverage > 80%
- [ ] Lighthouse score > 90 (accessibility)
- [ ] Zero warnings em produção
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado

---

## 👥 Responsabilidades

### Desenvolvedores
- ✅ Escrever código que passa lint
- ✅ Documentar suppressions
- ✅ Testar acessibilidade
- ✅ Manter code quality

### Code Reviewers
- ✅ Verificar lint warnings
- ✅ Validar suppressions
- ✅ Checar acessibilidade
- ✅ Questionar desvios de padrão

### Tech Leads
- ✅ Definir padrões
- ✅ Revisar suppressions trimestralmente
- ✅ Atualizar configurações ESLint
- ✅ Treinar equipe

---

## 🏁 Conclusão

Manter código de alta qualidade é responsabilidade de todos. Este guia estabelece os padrões e práticas para garantir que o Adega Manager continue sendo um projeto enterprise-grade com código limpo, acessível e manutenível.

**Lembre-se**:
- Zero warnings não é meta, é requisito mínimo
- Acessibilidade é feature, não opção
- Documentar é tão importante quanto codificar
- Code quality é investimento de longo prazo

---

**Versão**: 1.0.0
**Última atualização**: 24 de outubro de 2025
**Autor**: Equipe Adega Manager
**Status**: ✅ Ativo
