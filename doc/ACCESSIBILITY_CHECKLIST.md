# ✅ Checklist de Acessibilidade - Adega Manager

## 🎯 Checklist para Novos Componentes

### 📋 **Checklist Básico - WCAG 2.1 AA**

#### **Elementos Interativos**
- [ ] Todo `<button>` tem texto visível ou `aria-label` descritivo
- [ ] Todo `<a>` tem texto descritivo ou `aria-label`
- [ ] Ícones funcionais têm `aria-label`, decorativos têm `aria-hidden="true"`
- [ ] Estados de foco visíveis: `focus-visible:ring-2 focus-visible:ring-adega-gold`
- [ ] Elementos clicáveis usam `<button>` ou `<a>`, não `<div>`

#### **Formulários**
- [ ] Todo `<input>` tem `<label>` associado ou `aria-label`
- [ ] Campos obrigatórios marcados com `aria-required="true"`
- [ ] Validação dinâmica com `aria-invalid="true/false"`
- [ ] Mensagens de erro com `role="alert"` e `aria-describedby`
- [ ] Grupos lógicos em `<fieldset>` com `<legend>`
- [ ] Placeholders não substituem labels

#### **Estrutura Semântica**
- [ ] Hierarquia de headings correta (H1 > H2 > H3)
- [ ] Landmarks semânticos (`<nav>`, `<main>`, `<aside>`, `<section>`)
- [ ] Listas estruturadas (`<ul>`, `<ol>`, `<li>`)
- [ ] Tabelas com `<caption>` e `scope="col"` em headers

#### **Conteúdo Visual**
- [ ] Contraste mínimo 4.5:1 (use cores do sistema Adega)
- [ ] Informação não transmitida apenas por cor
- [ ] Imagens funcionais com `alt` descritivo
- [ ] Imagens decorativas com `alt=""` ou `aria-hidden="true"`
- [ ] Ícones de status com indicadores visuais além da cor

#### **Navegação por Teclado**
- [ ] Todos os elementos interativos focáveis via Tab
- [ ] Ordem lógica de navegação (visual = programática)
- [ ] Trap de foco em modais (usar Radix UI Dialog)
- [ ] Esc fecha modais, dropdowns e overlays
- [ ] Enter/Space ativam botões

---

## 🔧 **Checklist Técnico Detalhado**

### **1. Botões e Ações**

```tsx
// ✅ Exemplo correto
<IconButton
  aria-label="Editar cliente João Silva"
  icon={Edit}
  onClick={handleEdit}
  variant="ghost"
  size="sm"
/>

// ❌ Evitar
<div onClick={handleEdit}>
  <Edit className="h-4 w-4" />
</div>
```

**Verificações:**
- [ ] Usa componente `Button` ou `IconButton`
- [ ] `aria-label` específico com contexto
- [ ] Ícones com `aria-hidden="true"`
- [ ] Estado de loading com indicador acessível

### **2. Formulários Complexos**

```tsx
// ✅ Exemplo correto
<fieldset className="space-y-4">
  <legend className="text-lg font-semibold">Dados Pessoais</legend>
  
  <FormField name="name" render={({ field }) => (
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
  )} />
</fieldset>
```

**Verificações:**
- [ ] `fieldset` + `legend` para grupos lógicos
- [ ] `aria-required` em campos obrigatórios
- [ ] `FormMessage` para validação (já tem `role="alert"`)
- [ ] `aria-describedby` conectando ajuda/erro

### **3. Tabelas de Dados**

```tsx
// ✅ Exemplo correto
<table role="table" aria-label="Lista de produtos">
  <caption className="sr-only">
    Tabela com {products.length} produtos do estoque
  </caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="none">Produto</th>
      <th scope="col" aria-sort="none">Estoque</th>
    </tr>
  </thead>
</table>
```

**Verificações:**
- [ ] `<caption>` descritivo (pode ser `sr-only`)
- [ ] `scope="col"` em todos os headers
- [ ] `aria-sort` preparado para ordenação
- [ ] `role="table"` e `aria-label` quando necessário

### **4. Cards e Métricas**

```tsx
// ✅ Exemplo correto
<Card 
  role="article"
  aria-labelledby="metric-title-0"
  aria-describedby="metric-desc-0"
>
  <CardTitle id="metric-title-0">Total de Vendas</CardTitle>
  <div aria-label="Valor: R$ 12.500">R$ 12.500</div>
  <p id="metric-desc-0">Crescimento de 15%</p>
</Card>
```

**Verificações:**
- [ ] `role="article"` para cards independentes
- [ ] IDs únicos para `aria-labelledby`/`aria-describedby`
- [ ] Valores com `aria-label` expandido
- [ ] Ícones decorativos com `aria-hidden="true"`

### **5. Gráficos e Visualizações**

```tsx
// ✅ Exemplo correto
<div role="img" aria-label="Gráfico de vendas mensais">
  <ResponsiveContainer>
    <BarChart data={data} />
  </ResponsiveContainer>
  
  <div className="sr-only">
    <h4>Dados do gráfico:</h4>
    <ul>
      {data.map((item, i) => (
        <li key={i}>{item.month}: {item.sales} vendas</li>
      ))}
    </ul>
  </div>
</div>
```

**Verificações:**
- [ ] `role="img"` no container do gráfico
- [ ] `aria-label` descritivo dos dados
- [ ] Tabela alternativa em `sr-only`
- [ ] Cores com indicadores visuais além da cor

---

## 🎨 **Checklist de Cores e Contraste**

### **Cores Aprovadas (Contraste 4.5:1+)**

```typescript
// ✅ Textos primários
'text-adega-platinum'    // #a6a6a6 - 7.2:1
'text-adega-silver'      // #8c8c8c - 5.1:1  
'text-adega-gold'        // #d4af37 - 8.3:1

// ✅ Estados
'text-green-400'         // Success - 6.8:1
'text-yellow-400'        // Warning - 6.1:1
'text-red-400'          // Error - 5.9:1

// ❌ Evitar (baixo contraste)
'text-adega-platinum/60' // Opacity reduz contraste
'text-gray-400'         // Pode ser insuficiente
```

**Verificações:**
- [ ] Evitar opacidade em textos importantes
- [ ] Testar contraste em modo escuro
- [ ] Validar com Color Contrast Analyser
- [ ] Status não depende apenas de cor

### **Indicadores Visuais Múltiplos**

```tsx
// ✅ Status com ícone + cor + padrão
<Badge className="text-red-400 font-bold border-2 animate-pulse">
  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
  Estoque Baixo
</Badge>
```

**Verificações:**
- [ ] Ícone contextual para cada status
- [ ] Padrão visual (bold, dash, solid)
- [ ] Animação para estados críticos
- [ ] `aria-label` expandido

---

## ⌨️ **Checklist de Navegação por Teclado**

### **Ordem de Foco**
- [ ] Tab segue ordem lógica visual
- [ ] Elementos importantes não ficam "presos"
- [ ] Skip links para conteúdo principal
- [ ] Foco visível em todos os elementos

### **Interações por Teclado**
- [ ] Enter/Space ativam botões
- [ ] Esc fecha modais/menus
- [ ] Setas navegam em listas
- [ ] Home/End vão para início/fim

### **Modais e Overlays**
- [ ] Foco vai para primeiro elemento focável
- [ ] Tab fica contido no modal (trap)
- [ ] Esc fecha o modal
- [ ] Foco retorna ao elemento que abriu

---

## 🧪 **Checklist de Testes**

### **Testes Automáticos**
- [ ] axe-core sem violações
- [ ] Lighthouse Accessibility Score 90+
- [ ] Testes Jest com jest-axe

### **Testes Manuais**
- [ ] Navegação completa por teclado
- [ ] Zoom 200% funcional
- [ ] Teste com leitor de tela (NVDA)
- [ ] Teste em mobile

### **Validação de Componente**

```bash
# ✅ Comandos para validar
npm run dev           # Testar em desenvolvimento
npm run build         # Verificar build sem erros
npm run lint          # Verificar code quality

# ✅ Console do navegador
runAxeAnalysis()      # Executar análise axe-core
```

---

## 📋 **Template de PR - Acessibilidade**

```markdown
## Checklist de Acessibilidade

### Elementos Interativos
- [ ] Botões com aria-label ou texto visível
- [ ] Ícones com aria-hidden quando decorativos
- [ ] Estados de foco visíveis

### Formulários (se aplicável)
- [ ] Labels associados a inputs
- [ ] Validação com aria-invalid
- [ ] Fieldsets para grupos lógicos

### Estrutura Semântica
- [ ] Headings hierárquicos
- [ ] Landmarks apropriados
- [ ] Tabelas com scope/caption

### Contraste e Visual
- [ ] Cores do tema Adega (contraste validado)
- [ ] Indicadores além de cor
- [ ] Imagens com alt apropriado

### Testes
- [ ] axe-core sem violações
- [ ] Navegação por teclado funcional
- [ ] Testado com leitor de tela

### Ferramentas Utilizadas
- [ ] IconButton para botões com ícone
- [ ] FormMessage para validação
- [ ] Badge com indicadores visuais
- [ ] Radix UI para componentes complexos
```

---

## 🎯 **Critérios de Aprovação**

### **Obrigatório (WCAG A/AA)**
- ✅ Zero violações axe-core
- ✅ Contraste mínimo 4.5:1
- ✅ Navegação por teclado completa
- ✅ Elementos semânticos corretos
- ✅ Aria-labels em interativos

### **Recomendado (Boas Práticas)**
- ✅ Lighthouse Score 95+
- ✅ Teste com leitor de tela
- ✅ Zoom 200% funcional
- ✅ Loading states acessíveis
- ✅ Documentação atualizada

### **Exceções Permitidas**
- Componentes de terceiros já acessíveis (Radix UI)
- Elementos puramente decorativos sem interação
- Animações que não afetam conteúdo

---

**Documento mantido por:** Equipe de Desenvolvimento  
**Versão:** 1.0 - WCAG 2.1 AA Compliance  
**Última atualização:** 3 de Agosto de 2025