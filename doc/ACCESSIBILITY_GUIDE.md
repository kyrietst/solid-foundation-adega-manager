# 🛡️ Guia de Acessibilidade - Adega Manager

## Visão Geral

Este guia estabelece as práticas de acessibilidade para desenvolvimento no **Adega Manager**, garantindo conformidade com **WCAG 2.1 AA** e uma experiência inclusiva para todos os usuários.

## 📋 Checklist Rápido para Novos Componentes

### ✅ Elementos Interativos
- [ ] Todo botão tem `aria-label` descritivo ou texto visível
- [ ] Ícones funcionais têm `aria-label`, decorativos têm `aria-hidden="true"`
- [ ] Links têm texto descritivo ou `aria-label`
- [ ] Estados de foco visíveis com `focus-visible:ring-2`

### ✅ Formulários
- [ ] Todo input tem `<label>` associado ou `aria-label`
- [ ] Campos obrigatórios marcados com `aria-required="true"`
- [ ] Validação com `aria-invalid` e mensagens com `role="alert"`
- [ ] Grupos lógicos em `<fieldset>` com `<legend>`
- [ ] Mensagens de erro com `aria-describedby`

### ✅ Estrutura Semântica
- [ ] Uso correto de headings (H1 > H2 > H3)
- [ ] Landmarks semânticos (`<nav>`, `<main>`, `<aside>`)
- [ ] Listas estruturadas (`<ul>`, `<ol>`, `<li>`)
- [ ] Tabelas com `<caption>`, `scope="col"` em headers

### ✅ Conteúdo Visual
- [ ] Contraste mínimo 4.5:1 (use cores do tema Adega)
- [ ] Informação não baseada apenas em cor
- [ ] Imagens com `alt` apropriado
- [ ] Ícones de status com indicadores visuais extras

### ✅ Navegação por Teclado
- [ ] Todos os elementos focáveis via Tab
- [ ] Ordem lógica de navegação
- [ ] Trap de foco em modais (Radix UI já implementa)
- [ ] Esc fecha modais/dropdowns

## 🎯 Padrões Implementados

### Componentes Base Acessíveis

#### **IconButton** - Botões apenas com ícones
```tsx
import { IconButton } from '@/shared/ui/primitives/icon-button';

<IconButton
  aria-label="Editar cliente João Silva"
  icon={Edit}
  onClick={handleEdit}
  variant="ghost"
  size="sm"
/>
```

#### **FormMessage** - Mensagens de validação
```tsx
// Já configurado com role="alert" e aria-live="polite"
<FormMessage />
```

#### **Badge com Indicadores Visuais**
```tsx
// CustomerSegmentBadge - já implementa ícones + cores + padrões
<CustomerSegmentBadge segment="VIP" />
// Resultado: 👑 VIP (ícone + texto + borda dupla + cor dourada)
```

### Formulários Acessíveis

```tsx
<fieldset className="space-y-4">
  <legend className="text-lg font-semibold">Dados do Cliente</legend>
  
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome *</FormLabel>
        <FormControl>
          <Input 
            placeholder="Nome completo" 
            aria-required="true"
            {...field} 
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</fieldset>
```

### Tabelas Acessíveis

```tsx
<table role="table" aria-label="Lista de clientes">
  <caption className="sr-only">
    Tabela com {customers.length} clientes. Use setas para navegar.
  </caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="none">Cliente</th>
      <th scope="col" aria-sort="none">LTV</th>
    </tr>
  </thead>
  <tbody>
    {/* conteúdo */}
  </tbody>
</table>
```

### Dashboard e Métricas

```tsx
<section role="region" aria-labelledby="metrics-title">
  <h3 id="metrics-title">Métricas de Vendas</h3>
  
  {/* Cards com IDs únicos */}
  <Card 
    role="article"
    aria-labelledby="metric-title-0"
    aria-describedby="metric-desc-0"
  >
    <CardTitle id="metric-title-0">Total de Vendas</CardTitle>
    <div aria-label="Valor: R$ 12.500">R$ 12.500</div>
    <p id="metric-desc-0">Crescimento de 15% no mês</p>
  </Card>
</section>
```

### Gráficos Acessíveis

```tsx
<div role="img" aria-label="Gráfico de vendas mensais com 12 meses de dados">
  <ResponsiveContainer>
    <BarChart data={salesData} aria-label="Vendas por mês">
      {/* configuração do gráfico */}
    </BarChart>
  </ResponsiveContainer>
  
  {/* Dados alternativos para leitores de tela */}
  <div className="sr-only">
    <h4>Dados tabulares das vendas:</h4>
    <ul>
      {salesData.map((data, index) => (
        <li key={index}>{data.month}: {data.vendas} vendas</li>
      ))}
    </ul>
  </div>
</div>
```

## 🎨 Sistema de Cores Acessível

### Cores do Tema Adega (Contraste Validado)

```typescript
// Cores primárias com contraste 4.5:1+
const colors = {
  // Textos principais
  primary: 'text-adega-platinum',    // #a6a6a6 - Contraste: 7.2:1
  secondary: 'text-adega-silver',    // #8c8c8c - Contraste: 5.1:1
  accent: 'text-adega-gold',         // #d4af37 - Contraste: 8.3:1
  
  // Estados
  success: 'text-green-400',         // Contraste: 6.8:1
  warning: 'text-adega-amber',       // Contraste: 7.1:1
  error: 'text-red-400',            // Contraste: 5.9:1
};

// ❌ Evitar (baixo contraste)
'text-adega-platinum/60'  // Opacidade reduz contraste
'text-adega-silver/40'    // Abaixo de 4.5:1

// ✅ Usar sempre
'text-adega-platinum'     // Texto principal
'text-adega-silver'       // Texto secundário
```

### Indicadores Visuais Além de Cor

```typescript
// Status de estoque com múltiplos indicadores
const stockIndicators = {
  critical: {
    color: 'text-red-400',
    icon: XCircle,
    pattern: 'border-2 animate-pulse font-bold',
    description: 'Estoque crítico'
  },
  adequate: {
    color: 'text-yellow-400', 
    icon: AlertTriangle,
    pattern: 'border-dashed font-medium',
    description: 'Estoque adequado'
  },
  high: {
    color: 'text-green-400',
    icon: CheckCircle, 
    pattern: 'font-semibold',
    description: 'Estoque alto'
  }
};
```

## 🧪 Testes de Acessibilidade

### Configuração do axe-core

```typescript
// src/lib/axe-config.ts já configurado
// Para executar testes manuais:
import { runAxeAnalysis } from '@/lib/axe-config';

// Em desenvolvimento, no console:
runAxeAnalysis();
```

### Testes Automáticos com Jest

```typescript
// exemplo: tests/accessibility/form.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CustomerForm } from '@/features/customers/components/CustomerForm';

expect.extend(toHaveNoViolations);

test('CustomerForm não deve ter violações de acessibilidade', async () => {
  const { container } = render(<CustomerForm onSuccess={() => {}} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Lista de Verificação Manual

1. **Navegação por Teclado**
   - [ ] Tab navega por todos os elementos interativos
   - [ ] Shift+Tab navega na ordem inversa
   - [ ] Enter/Space ativa botões e links
   - [ ] Esc fecha modais e dropdowns
   - [ ] Setas navegam em listas e tabelas

2. **Leitores de Tela** (NVDA, JAWS, VoiceOver)
   - [ ] Elementos anunciados corretamente
   - [ ] Mudanças de estado anunciadas
   - [ ] Estrutura de headings lógica
   - [ ] Formulários com labels claros

3. **Zoom e Responsividade**
   - [ ] Interface funcional até 200% de zoom
   - [ ] Texto legível em dispositivos móveis
   - [ ] Componentes não se sobrepõem

## 🚨 Erros Comuns a Evitar

### ❌ Problemas Frequentes

```tsx
// ❌ Botão sem label
<Button onClick={handleEdit}>
  <Edit className="h-4 w-4" />
</Button>

// ❌ Ícone funcional sem label
<Eye className="h-4 w-4" onClick={view} />

// ❌ Div clicável
<div onClick={handleClick} className="cursor-pointer">
  Clique aqui
</div>

// ❌ Contraste baixo
<span className="text-gray-400/50">Texto importante</span>

// ❌ Informação apenas por cor
<span className="text-red-500">Status crítico</span>
```

### ✅ Correções

```tsx
// ✅ Botão com label
<Button onClick={handleEdit} aria-label="Editar cliente João Silva">
  <Edit className="h-4 w-4" aria-hidden="true" />
</Button>

// ✅ Componente IconButton
<IconButton
  aria-label="Visualizar detalhes do cliente"
  icon={Eye}
  onClick={handleView}
/>

// ✅ Botão semântico
<button onClick={handleClick} className="cursor-pointer">
  Clique aqui
</button>

// ✅ Contraste adequado
<span className="text-adega-silver">Texto importante</span>

// ✅ Múltiplos indicadores
<Badge className="text-red-400 font-bold border-2 animate-pulse">
  <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
  Status Crítico
</Badge>
```

## 📖 Recursos e Referências

### Documentação
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)

### Ferramentas de Teste
- **axe-core** - Testes automatizados (já configurado)
- **WAVE** - Análise visual de acessibilidade
- **Lighthouse** - Auditoria completa do Chrome
- **Color Contrast Analyser** - Verificação de contraste

### Leitores de Tela
- **NVDA** (Windows) - Gratuito
- **JAWS** (Windows) - Comercial
- **VoiceOver** (Mac/iOS) - Nativo
- **TalkBack** (Android) - Nativo

## 🔄 Fluxo de Desenvolvimento

1. **Planejamento**: Considerar acessibilidade desde o design
2. **Desenvolvimento**: Seguir checklist e usar componentes base
3. **Teste Automático**: Executar axe-core durante desenvolvimento
4. **Teste Manual**: Verificar navegação por teclado
5. **Validação**: Testar com leitores de tela
6. **Documentação**: Atualizar componentes e padrões

## 🎯 Próximos Passos

- **Integração CI/CD**: Testes de acessibilidade automáticos
- **Treinamento**: Workshops para a equipe
- **Validação Usuário**: Testes com usuários reais
- **Monitoramento**: Métricas de acessibilidade contínuas

---

**Documento mantido por:** Equipe de Desenvolvimento Adega Manager  
**Última atualização:** 3 de Agosto de 2025  
**Versão:** 1.0 - Implementação inicial WCAG 2.1 AA