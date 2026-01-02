# ESLint Accessibility Patterns - Adega Manager

## 📋 Índice

1. [Overview](#overview)
2. [Label Association Patterns](#label-association-patterns)
3. [Keyboard Event Patterns](#keyboard-event-patterns)
4. [AutoFocus Removal](#autofocus-removal)
5. [Common Pitfalls](#common-pitfalls)
6. [Quick Reference](#quick-reference)

---

## Overview

Este guia documenta **padrões práticos e reutilizáveis** para correções de acessibilidade identificadas pelo ESLint (`eslint-plugin-jsx-a11y`).

### Regras Cobertas

| Regra ESLint | Severity | Descrição | Padrão |
|--------------|----------|-----------|--------|
| `label-has-associated-control` | Error | Labels devem estar associados a controles | [§2](#label-association-patterns) |
| `click-events-have-key-events` | Error | Elementos clicáveis precisam de keyboard handlers | [§3](#keyboard-event-patterns) |
| `no-static-element-interactions` | Error | Elementos não-interativos não devem ter event handlers | [§3](#keyboard-event-patterns) |
| `no-autofocus` | Warning | Evitar uso de autoFocus | [§4](#autofocus-removal) |

---

## Label Association Patterns

### Pattern 1: Input Básico

**❌ Problema:**
```tsx
<label className="text-sm">Nome</label>
<Input value={name} onChange={setName} />
```

**✅ Solução:**
```tsx
<label htmlFor="customer-name" className="text-sm">
  Nome
</label>
<Input
  id="customer-name"
  value={name}
  onChange={setName}
/>
```

**Checklist:**
- [x] `htmlFor` no label
- [x] `id` no input
- [x] IDs devem ser únicos na página
- [x] htmlFor === id

---

### Pattern 2: Select (Shadcn/ui)

**❌ Problema:**
```tsx
<label>Categoria</label>
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    {/* options */}
  </SelectContent>
</Select>
```

**✅ Solução:**
```tsx
<label htmlFor="product-category">Categoria</label>
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger id="product-category">
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    {/* options */}
  </SelectContent>
</Select>
```

**⚠️ Importante:** O `id` vai no `SelectTrigger`, não no `Select`.

---

### Pattern 3: Textarea

**❌ Problema:**
```tsx
<label>Descrição</label>
<Textarea value={description} onChange={setDescription} />
```

**✅ Solução:**
```tsx
<label htmlFor="product-description">Descrição</label>
<Textarea
  id="product-description"
  value={description}
  onChange={setDescription}
/>
```

---

### Pattern 4: Radio Group

**❌ Problema:**
```tsx
<label>Tipo de Venda</label>
<RadioGroup value={type} onValueChange={setType}>
  <RadioGroupItem value="local" />
  <RadioGroupItem value="delivery" />
</RadioGroup>
```

**✅ Solução:**
```tsx
<label htmlFor="sale-type">Tipo de Venda</label>
<RadioGroup id="sale-type" value={type} onValueChange={setType}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem id="sale-type-local" value="local" />
    <label htmlFor="sale-type-local">Local</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem id="sale-type-delivery" value="delivery" />
    <label htmlFor="sale-type-delivery">Delivery</label>
  </div>
</RadioGroup>
```

**Checklist:**
- [x] Label para o grupo (`RadioGroup`)
- [x] Label para cada item (`RadioGroupItem`)
- [x] IDs únicos para cada radio

---

### Pattern 5: Checkbox

**❌ Problema:**
```tsx
<label>Aceito os termos</label>
<Checkbox checked={accepted} onCheckedChange={setAccepted} />
```

**✅ Solução:**
```tsx
<div className="flex items-center space-x-2">
  <Checkbox
    id="terms-accepted"
    checked={accepted}
    onCheckedChange={setAccepted}
  />
  <label htmlFor="terms-accepted">
    Aceito os termos e condições
  </label>
</div>
```

**💡 Dica:** Para checkboxes, é comum colocar o label DEPOIS do checkbox.

---

### Pattern 6: BarcodeInput (Custom Component)

**❌ Problema:**
```tsx
<label>Código de Barras</label>
<BarcodeInput onScan={handleScan} />
```

**✅ Solução:**
```tsx
<label htmlFor="product-barcode">Código de Barras</label>
<BarcodeInput
  id="product-barcode"
  onScan={handleScan}
  placeholder="Escaneie ou digite o código..."
/>
```

**⚠️ Nota:** Se o componente customizado não aceita `id`, refatorar o componente para aceitar e passar via spread props.

---

### Pattern 7: Formulário Completo

**✅ Example - Formulário de Cliente:**

```tsx
<form className="space-y-4">
  {/* Nome */}
  <div>
    <label htmlFor="customer-name" className="text-sm font-medium">
      Nome Completo *
    </label>
    <Input
      id="customer-name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </div>

  {/* Email */}
  <div>
    <label htmlFor="customer-email" className="text-sm font-medium">
      E-mail
    </label>
    <Input
      id="customer-email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  {/* Telefone */}
  <div>
    <label htmlFor="customer-phone" className="text-sm font-medium">
      Telefone *
    </label>
    <Input
      id="customer-phone"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      required
    />
  </div>

  {/* Segmento */}
  <div>
    <label htmlFor="customer-segment" className="text-sm font-medium">
      Segmento
    </label>
    <Select value={segment} onValueChange={setSegment}>
      <SelectTrigger id="customer-segment">
        <SelectValue placeholder="Selecione o segmento" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="premium">Premium</SelectItem>
        <SelectItem value="regular">Regular</SelectItem>
        <SelectItem value="occasional">Ocasional</SelectItem>
      </SelectContent>
    </Select>
  </div>
</form>
```

---

## Keyboard Event Patterns

### Pattern 1: Div Clicável Simples

**❌ Problema:**
```tsx
<div
  className="cursor-pointer p-4 hover:bg-gray-800"
  onClick={() => handleSelect(item)}
>
  {item.name}
</div>
```

**✅ Solução:**
```tsx
<div
  role="button"
  tabIndex={0}
  className="cursor-pointer p-4 hover:bg-gray-800"
  onClick={() => handleSelect(item)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(item);
    }
  }}
>
  {item.name}
</div>
```

**Atributos Essenciais:**
- `role="button"` - Define como botão para screen readers
- `tabIndex={0}` - Torna focável via Tab
- `onKeyDown` - Handler para Enter/Space

**⚠️ Importante:** `e.preventDefault()` é crucial para evitar scroll ao pressionar Space.

---

### Pattern 2: Seção Colapsável (Accordion)

**❌ Problema:**
```tsx
const [isExpanded, setIsExpanded] = useState(false);

<div
  className="cursor-pointer"
  onClick={() => setIsExpanded(!isExpanded)}
>
  <h4>Pagamento</h4>
  {isExpanded ? <ChevronUp /> : <ChevronDown />}
</div>

{isExpanded && (
  <div>{/* conteúdo */}</div>
)}
```

**✅ Solução:**
```tsx
const [isExpanded, setIsExpanded] = useState(false);

<div
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  className="cursor-pointer"
  onClick={() => setIsExpanded(!isExpanded)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  }}
>
  <h4>Pagamento</h4>
  {isExpanded ? <ChevronUp /> : <ChevronDown />}
</div>

{isExpanded && (
  <div role="region" aria-labelledby="payment-section">
    {/* conteúdo */}
  </div>
)}
```

**ARIA Attributes:**
- `aria-expanded` - Indica estado expandido/colapsado
- `role="region"` - Define área de conteúdo
- `aria-labelledby` - Conecta região ao título

---

### Pattern 3: Lista de Seleção com Navegação

**✅ Pattern Completo:**

```tsx
const CustomerList: React.FC<Props> = ({ customers, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, customer: Customer) => {
    // Enter ou Space - Selecionar
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(customer);
      return;
    }

    // Arrow Down - Próximo item
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, customers.length - 1);
      setFocusedIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
      return;
    }

    // Arrow Up - Item anterior
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      setFocusedIndex(prevIndex);
      itemRefs.current[prevIndex]?.focus();
      return;
    }

    // Home - Primeiro item
    if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      itemRefs.current[0]?.focus();
      return;
    }

    // End - Último item
    if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = customers.length - 1;
      setFocusedIndex(lastIndex);
      itemRefs.current[lastIndex]?.focus();
      return;
    }
  };

  return (
    <div role="listbox" aria-label="Clientes">
      {customers.map((customer, index) => (
        <div
          key={customer.id}
          ref={(el) => (itemRefs.current[index] = el)}
          role="option"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
          className="p-3 hover:bg-gray-800 cursor-pointer"
          onClick={() => onSelect(customer)}
          onKeyDown={(e) => handleKeyDown(e, index, customer)}
        >
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-gray-400">{customer.email}</p>
        </div>
      ))}
    </div>
  );
};
```

**Features:**
- ✅ Navegação por setas (↑ ↓)
- ✅ Home/End para primeira/última
- ✅ Enter/Space para selecionar
- ✅ `tabIndex` dinâmico (roving tabindex pattern)
- ✅ ARIA roles (listbox, option)

---

### Pattern 4: Drag-and-Drop Zone

**❌ Problema:**
```tsx
<div
  className="border-2 border-dashed cursor-pointer"
  onClick={handleFileSelect}
  onDrop={handleDrop}
>
  Arraste arquivos ou clique para selecionar
</div>
```

**✅ Solução:**
```tsx
const handleFileSelect = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFile(file);
  };
  input.click();
};

<div
  role="button"
  tabIndex={0}
  className="border-2 border-dashed cursor-pointer"
  onClick={handleFileSelect}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFileSelect();
    }
  }}
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
>
  <Upload className="h-12 w-12 mx-auto" />
  <p>Arraste arquivos ou pressione Enter para selecionar</p>
</div>
```

**⚠️ Nota:** Sempre extrair a lógica de seleção de arquivo para uma função, para reutilizar em `onClick` e `onKeyDown`.

---

### Pattern 5: Card Clicável

**❌ Problema:**
```tsx
<div
  className="card"
  onClick={() => navigate(`/product/${product.id}`)}
>
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <p>{formatCurrency(product.price)}</p>
</div>
```

**✅ Solução Preferencial - Usar <Link>:**
```tsx
import { Link } from 'react-router-dom';

<Link
  to={`/product/${product.id}`}
  className="card block hover:shadow-lg transition"
>
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <p>{formatCurrency(product.price)}</p>
</Link>
```

**💡 Dica:** Sempre preferir elementos nativos (`<a>`, `<button>`) quando possível.

**✅ Solução Alternativa - Se precisar de div:**
```tsx
<div
  role="link"
  tabIndex={0}
  className="card cursor-pointer"
  onClick={() => navigate(`/product/${product.id}`)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/product/${product.id}`);
    }
  }}
>
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <p>{formatCurrency(product.price)}</p>
</div>
```

---

## AutoFocus Removal

### Por que Evitar autoFocus?

**Problemas:**
1. **Screen Readers:** Desorientante, usuário perde contexto
2. **Scroll Indesejado:** Pode fazer scroll automático para o campo
3. **Mobile:** Abre teclado inesperadamente
4. **Multi-step Forms:** Interfere na navegação sequencial
5. **Modais:** Pode focar antes da animação de abertura

**Exceções Raras (justificáveis):**
- Search bars em páginas de busca dedicadas
- Login forms (primeira interação esperada)
- Modais de confirmação crítica (após 500ms delay)

---

### Pattern 1: Remover autoFocus Simples

**❌ Problema:**
```tsx
<Input
  autoFocus
  value={search}
  onChange={setSearch}
/>
```

**✅ Solução:**
```tsx
<Input
  value={search}
  onChange={setSearch}
  placeholder="Digite para buscar..."
/>
```

---

### Pattern 2: Remover autoFocus de BarcodeInput

**❌ Problema:**
```tsx
<BarcodeInput
  onScan={handleScan}
  autoFocus={true}
  placeholder="Escaneie o código..."
/>
```

**✅ Solução:**
```tsx
<BarcodeInput
  onScan={handleScan}
  placeholder="Escaneie o código..."
/>
```

---

### Pattern 3: Foco Programático (Se Necessário)

**❌ Usando autoFocus:**
```tsx
<Input autoFocus value={name} onChange={setName} />
```

**✅ Usando useEffect + ref:**
```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  // Delay para garantir que modal foi aberto
  const timer = setTimeout(() => {
    inputRef.current?.focus();
  }, 300);

  return () => clearTimeout(timer);
}, []);

<Input
  ref={inputRef}
  value={name}
  onChange={setName}
/>
```

**💡 Quando usar foco programático:**
- Modais de confirmação de ações destrutivas
- Campos de erro após validação
- Primeiro campo de formulários multi-etapa

---

### Pattern 4: Scanner Condicional

**❌ autoFocus Sempre Ativo:**
```tsx
<BarcodeInput
  autoFocus={true}
  onScan={handleScan}
/>
```

**✅ Foco Condicional via Estado:**
```tsx
const [activeScanner, setActiveScanner] = useState(false);
const scannerRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (activeScanner) {
    // Focar quando scanner é ativado
    scannerRef.current?.focus();
  }
}, [activeScanner]);

{activeScanner && (
  <BarcodeInput
    ref={scannerRef}
    onScan={handleScan}
    placeholder="Escaneie o código..."
  />
)}

<Button onClick={() => setActiveScanner(true)}>
  Ativar Scanner
</Button>
```

---

## Common Pitfalls

### 1. IDs Duplicados

**❌ Problema:**
```tsx
// Componente usado múltiplas vezes
const FilterSelect = ({ value, onChange }) => (
  <>
    <label htmlFor="filter">Filtro</label>
    <Select onValueChange={onChange}>
      <SelectTrigger id="filter"> {/* ID duplicado! */}
        <SelectValue />
      </SelectTrigger>
    </Select>
  </>
);

// Usado 3 vezes na mesma página:
<FilterSelect value={filter1} onChange={setFilter1} />
<FilterSelect value={filter2} onChange={setFilter2} />
<FilterSelect value={filter3} onChange={setFilter3} />
```

**✅ Solução - Passar ID como prop:**
```tsx
interface FilterSelectProps {
  id: string; // ID único obrigatório
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ id, label, value, onChange }) => (
  <>
    <label htmlFor={id}>{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
    </Select>
  </>
);

// Uso:
<FilterSelect id="category-filter" label="Categoria" value={category} onChange={setCategory} />
<FilterSelect id="supplier-filter" label="Fornecedor" value={supplier} onChange={setSupplier} />
<FilterSelect id="status-filter" label="Status" value={status} onChange={setStatus} />
```

---

### 2. onClick sem onKeyDown

**❌ Esquecendo Keyboard:**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
>
  Clique aqui
</div>
```

**⚠️ Problema:** Focável via Tab, mas não ativável via Enter/Space.

**✅ Sempre Adicionar onKeyDown:**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Clique aqui
</div>
```

---

### 3. tabIndex Incorreto

**❌ Problemas Comuns:**
```tsx
// tabIndex negativo - elemento não focável
<div tabIndex={-1} onClick={handleClick}>...</div>

// tabIndex > 0 - quebra ordem natural de foco
<div tabIndex={1} onClick={handleClick}>...</div>
<div tabIndex={2} onClick={handleClick}>...</div>
```

**✅ Sempre usar tabIndex={0}:**
```tsx
<div tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
  Elemento focável
</div>
```

**Regra:** Use apenas `0` (focável) ou `-1` (não focável).

---

### 4. Falta de preventDefault em Space

**❌ Sem preventDefault:**
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === ' ') {
      handleClick(); // Vai fazer scroll!
    }
  }}
>
  Clique aqui
</div>
```

**✅ Sempre usar preventDefault:**
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === ' ') {
      e.preventDefault(); // Previne scroll
      handleClick();
    }
  }}
>
  Clique aqui
</div>
```

---

## Quick Reference

### Cheatsheet - Label Association

```tsx
// Input
<label htmlFor="field-id">Label</label>
<Input id="field-id" />

// Select
<label htmlFor="select-id">Label</label>
<Select>
  <SelectTrigger id="select-id" />
</Select>

// Textarea
<label htmlFor="textarea-id">Label</label>
<Textarea id="textarea-id" />

// Checkbox
<Checkbox id="checkbox-id" />
<label htmlFor="checkbox-id">Label</label>
```

### Cheatsheet - Keyboard Events

```tsx
// Padrão básico
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
/>

// Com toggle state
<div
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  onClick={() => setIsExpanded(!isExpanded)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  }}
/>
```

### Cheatsheet - Roles Comuns

| Elemento | Role Correto | Exemplo |
|----------|--------------|---------|
| Div clicável | `role="button"` | Botão customizado |
| Lista de seleção | `role="listbox"` + `role="option"` | Dropdown customizado |
| Link customizado | `role="link"` | Navegação customizada |
| Seção colapsável | `role="button"` + `aria-expanded` | Accordion |
| Tabs | `role="tablist"` + `role="tab"` | Tabs customizadas |

### Cheatsheet - ARIA Attributes

| Attribute | Uso | Exemplo |
|-----------|-----|---------|
| `aria-label` | Label invisível | `<button aria-label="Fechar modal">×</button>` |
| `aria-labelledby` | Conectar a label existente | `<div role="region" aria-labelledby="title-id">` |
| `aria-expanded` | Estado expandido/colapsado | `<div aria-expanded={isOpen}>` |
| `aria-selected` | Item selecionado em lista | `<div role="option" aria-selected={isSelected}>` |
| `aria-disabled` | Elemento desabilitado | `<div aria-disabled={true}>` |

---

**Última atualização:** 2025-10-23
**Autor:** Adega Manager Team
**Versão:** 3.0.1 - Accessibility Patterns
