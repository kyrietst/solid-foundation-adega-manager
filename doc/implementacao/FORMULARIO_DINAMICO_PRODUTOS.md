# Formulário Dinâmico de Produtos - Especificação Técnica

## 📋 Visão Geral

Esta especificação define a implementação de um formulário dinâmico para cadastro de produtos que adapta os campos de entrada baseado na categoria selecionada, proporcionando uma experiência mais intuitiva e específica para cada tipo de produto.

## 🎯 Objetivos

### Objetivos Principais
- **Campos Específicos**: Exibir apenas campos relevantes para cada categoria
- **UX Melhorada**: Interface mais limpa e intuitiva
- **Validação Inteligente**: Validações específicas por categoria
- **Flexibilidade**: Fácil adição de novas categorias e campos

### Objetivos Secundários
- **Performance**: Reduzir complexidade da interface
- **Manutenibilidade**: Código organizado e extensível
- **Consistência**: Padrões uniformes entre categorias

---

## 🗂️ Mapeamento de Categorias e Campos

### 🍷 **Bebidas Alcoólicas**
**Categorias**: `Vinho Tinto`, `Vinho Branco`, `Vinho Rosé`, `Espumante`, `Whisky`, `Vodka`, `Gin`, `Rum`, `Cachaça`, `Destilados`

**Campos Específicos**:
```typescript
{
  volume_ml: {
    label: "Volume",
    type: "number",
    required: true,
    unit: "ml",
    placeholder: "750",
    min: 50,
    max: 5000,
    step: 50
  },
  alcohol_content: {
    label: "Teor Alcoólico",
    type: "number",
    required: true,
    unit: "%",
    placeholder: "40",
    min: 0,
    max: 100,
    step: 0.1
  },
  container_type: {
    label: "Tipo de Embalagem",
    type: "select",
    required: false,
    options: ["Garrafa", "Lata", "Barril", "Bag-in-Box", "Miniatura"],
    default: "Garrafa"
  },
  origin_region: {
    label: "Região/Origem",
    type: "text",
    required: false,
    placeholder: "Ex: Bordeaux, Scotch Highlands"
  }
}
```

**Validações Específicas**:
- Volume mínimo: 50ml
- Teor alcoólico: 0-100%
- Container obrigatório para vendas por pacote

---

### 🍺 **Cerveja**
**Categorias**: `Cerveja`

**Campos Específicos**:
```typescript
{
  volume_ml: {
    label: "Volume",
    type: "number",
    required: true,
    unit: "ml",
    placeholder: "350",
    options: [269, 350, 473, 500, 600, 1000],
    allowCustom: true
  },
  alcohol_content: {
    label: "Teor Alcoólico",
    type: "number",
    required: true,
    unit: "%",
    placeholder: "4.5",
    min: 0,
    max: 15,
    step: 0.1
  },
  beer_style: {
    label: "Estilo da Cerveja",
    type: "select",
    required: false,
    options: [
      "Pilsen", "IPA", "Lager", "Ale", "Stout", "Porter", 
      "Witbier", "Weizen", "Sour", "Fruit Beer", "Outros"
    ]
  },
  container_type: {
    label: "Embalagem",
    type: "select",
    required: true,
    options: ["Lata", "Garrafa Long Neck", "Garrafa 600ml", "Barril", "Growler"],
    default: "Lata"
  },
  ibu: {
    label: "IBU (Amargor)",
    type: "number",
    required: false,
    min: 0,
    max: 120,
    placeholder: "20"
  }
}
```

---

### 🥤 **Bebidas Não-Alcoólicas**
**Categorias**: `Refrigerante`, `Suco`, `Água`, `Energético`

**Campos Específicos**:
```typescript
{
  volume_ml: {
    label: "Volume",
    type: "number",
    required: true,
    unit: "ml",
    placeholder: "350",
    options: [200, 250, 350, 500, 600, 1000, 2000],
    allowCustom: true
  },
  flavor: {
    label: "Sabor",
    type: "text",
    required: false,
    placeholder: "Ex: Cola, Laranja, Limão"
  },
  container_type: {
    label: "Tipo de Embalagem",
    type: "select",
    required: true,
    options: ["Lata", "Garrafa PET", "Garrafa Vidro", "Tetra Pak", "Pouch"],
    default: "Lata"
  },
  has_gas: {
    label: "Com Gás",
    type: "boolean",
    required: false,
    default: false
  },
  sugar_free: {
    label: "Sem Açúcar/Diet",
    type: "boolean",
    required: false,
    default: false
  }
}
```

---

### 🚬 **Tabacaria**
**Categorias**: `Cigarro`, `Charuto`, `Fumo`, `Tabacaria`

**Campos Específicos**:
```typescript
{
  units_per_pack: {
    label: "Unidades por Pacote",
    type: "number",
    required: true,
    placeholder: "20",
    min: 1,
    max: 50
  },
  tobacco_type: {
    label: "Tipo de Produto",
    type: "select",
    required: true,
    options: ["Cigarro", "Charuto", "Fumo de Corda", "Fumo de Rolo", "Cigarrilha", "Isqueiro", "Seda"]
  },
  brand: {
    label: "Marca",
    type: "text",
    required: true,
    placeholder: "Ex: Marlboro, Dunhill"
  },
  nicotine_level: {
    label: "Nível de Nicotina",
    type: "select",
    required: false,
    options: ["Ultra Light", "Light", "Medium", "Strong", "Extra Strong"]
  },
  package_type: {
    label: "Tipo de Embalagem",
    type: "select",
    required: false,
    options: ["Maço", "Carteira", "Caixa", "Pacote", "Avulso"]
  }
}
```

---

### 🍭 **Doces e Snacks**
**Categorias**: `Doce`, `Chocolate`, `Bala`, `Snack`, `Salgadinho`

**Campos Específicos**:
```typescript
{
  weight_g: {
    label: "Peso",
    type: "number",
    required: true,
    unit: "g",
    placeholder: "50",
    min: 1,
    max: 5000
  },
  package_type: {
    label: "Tipo de Embalagem",
    type: "select",
    required: true,
    options: ["Individual", "Pacote", "Caixa", "Display", "Granel"],
    default: "Individual"
  },
  has_expiration: {
    label: "Controle de Validade Obrigatório",
    type: "boolean",
    required: false,
    default: true
  },
  flavor: {
    label: "Sabor",
    type: "text",
    required: false,
    placeholder: "Ex: Chocolate, Morango, Sal"
  },
  allergens: {
    label: "Contém Alérgenos",
    type: "multiselect",
    required: false,
    options: ["Glúten", "Lactose", "Amendoim", "Nozes", "Soja", "Ovos"]
  }
}
```

---

### 📦 **Outros Produtos**
**Categorias**: `Outros`, `Utensílios`, `Acessórios`

**Campos Específicos**:
```typescript
{
  unit_measure: {
    label: "Unidade de Medida",
    type: "select",
    required: true,
    options: ["Unidade", "Quilograma", "Grama", "Litro", "Metro", "Pacote", "Caixa"],
    default: "Unidade"
  },
  dimensions: {
    label: "Dimensões (cm)",
    type: "text",
    required: false,
    placeholder: "Ex: 10x20x5"
  },
  material: {
    label: "Material",
    type: "text",
    required: false,
    placeholder: "Ex: Plástico, Metal, Vidro"
  }
}
```

---

## 🏗️ Arquitetura Técnica

### Estrutura de Tipos TypeScript

```typescript
// types/inventory.types.ts

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'boolean';

export interface FieldConfig {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default?: any;
  allowCustom?: boolean;
}

export interface CategoryConfig {
  name: string;
  fields: Record<string, FieldConfig>;
  validations: ValidationRule[];
  icon?: string;
}

export interface DynamicFormData {
  // Campos básicos (sempre presentes)
  name: string;
  category: string;
  description?: string;
  
  // Campos dinâmicos (baseados na categoria)
  dynamic_fields: Record<string, any>;
  
  // Campos de controle (sempre presentes)
  price: number;
  cost_price: number;
  stock_quantity: number;
  minimum_stock: number;
  barcode?: string;
}
```

### Hook Personalizado: useDynamicFields

```typescript
// hooks/useDynamicFields.ts

export const useDynamicFields = (category: string) => {
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});
  
  const categoryConfig = getCategoryConfig(category);
  
  const updateField = (fieldName: string, value: any) => {
    setDynamicData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const validateFields = () => {
    // Implementar validação baseada na categoria
  };
  
  const resetFields = () => {
    setDynamicData({});
  };
  
  return {
    fields: categoryConfig.fields,
    data: dynamicData,
    updateField,
    validateFields,
    resetFields,
    isValid: validateFields()
  };
};
```

### Configuração de Categorias

```typescript
// config/categoryConfigs.ts

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'Cerveja': {
    name: 'Cerveja',
    fields: {
      volume_ml: { /* configuração */ },
      alcohol_content: { /* configuração */ },
      // ... outros campos
    },
    validations: [
      { field: 'volume_ml', rule: 'min', value: 50 },
      { field: 'alcohol_content', rule: 'required' }
    ]
  },
  // ... outras categorias
};
```

---

## 🔧 Implementação

### Componente Principal: DynamicProductForm

```typescript
// components/inventory/DynamicProductForm.tsx

export const DynamicProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [basicData, setBasicData] = useState(/* dados básicos */);
  const { fields, data, updateField, isValid } = useDynamicFields(basicData.category);
  
  const handleCategoryChange = (newCategory: string) => {
    setBasicData(prev => ({ ...prev, category: newCategory }));
    // Preservar dados compatíveis entre categorias
  };
  
  const renderDynamicFields = () => {
    return Object.entries(fields).map(([fieldName, config]) => (
      <DynamicField
        key={fieldName}
        name={fieldName}
        config={config}
        value={data[fieldName]}
        onChange={(value) => updateField(fieldName, value)}
      />
    ));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos básicos */}
      <BasicFieldsSection />
      
      {/* Campos dinâmicos */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Específicas</CardTitle>
          <CardDescription>
            Campos específicos para {basicData.category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderDynamicFields()}
        </CardContent>
      </Card>
      
      {/* Controles de preço e estoque */}
      <PricingSection />
      <StockSection />
    </form>
  );
};
```

---

## 🧪 Validações e Regras

### Validações por Categoria

```typescript
const VALIDATION_RULES = {
  'Cerveja': [
    { field: 'volume_ml', rules: ['required', 'min:50', 'max:5000'] },
    { field: 'alcohol_content', rules: ['required', 'min:0', 'max:15'] },
    { field: 'container_type', rules: ['required'] }
  ],
  'Destilados': [
    { field: 'volume_ml', rules: ['required', 'min:50'] },
    { field: 'alcohol_content', rules: ['required', 'min:20', 'max:100'] }
  ],
  // ... outras categorias
};
```

### Migração de Dados

```typescript
const migrateLegacyData = (oldProduct: Product): DynamicFormData => {
  const { category } = oldProduct;
  const dynamicFields: Record<string, any> = {};
  
  // Mapear campos legados para novos campos dinâmicos
  if (category.includes('Vinho') || category === 'Cerveja') {
    dynamicFields.volume_ml = oldProduct.volume_ml;
    dynamicFields.alcohol_content = oldProduct.alcohol_content;
  }
  
  return {
    ...oldProduct,
    dynamic_fields: dynamicFields
  };
};
```

---

## 📊 Banco de Dados

### Estrutura de Armazenamento

**Opção 1: Campos JSON** (Recomendada)
```sql
ALTER TABLE products 
ADD COLUMN dynamic_fields JSONB DEFAULT '{}';

-- Índice para consultas específicas
CREATE INDEX idx_products_dynamic_fields 
ON products USING gin (dynamic_fields);
```

**Opção 2: Campos Específicos** (Alternativa)
```sql
-- Adicionar campos específicos mais comuns
ALTER TABLE products 
ADD COLUMN volume_ml INTEGER,
ADD COLUMN alcohol_content DECIMAL(3,1),
ADD COLUMN container_type VARCHAR(50),
ADD COLUMN flavor VARCHAR(100);
```

---

## 🎨 Interface do Usuário

### Transições e Animações

```css
.dynamic-fields-container {
  transition: all 0.3s ease-in-out;
}

.field-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.field-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
}

.field-exit {
  opacity: 1;
  transform: translateY(0);
}

.field-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;
}
```

### Responsividade

```typescript
const DynamicField: React.FC = ({ name, config, value, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor={name}>
          {config.label}
          {config.required && <span className="text-red-500">*</span>}
          {config.unit && <span className="text-muted-foreground"> ({config.unit})</span>}
        </Label>
        
        {config.type === 'select' ? (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={name}
            type={config.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            step={config.step}
            required={config.required}
          />
        )}
      </div>
    </div>
  );
};
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Criar tipos TypeScript para campos dinâmicos
- [ ] Implementar configurações de categoria
- [ ] Criar hook `useDynamicFields`
- [ ] Desenvolver componente `DynamicField`

### Fase 2: Integração
- [ ] Refatorar `ProductForm` principal
- [ ] Implementar sistema de validação
- [ ] Adicionar transições suaves
- [ ] Testes de unidade para lógica dinâmica

### Fase 3: Dados e Migração
- [ ] Atualizar estrutura do banco de dados
- [ ] Implementar migração de dados existentes
- [ ] Atualizar APIs de criação/edição
- [ ] Testes de integração

### Fase 4: UX e Polimento
- [ ] Animações e transições
- [ ] Validação em tempo real
- [ ] Tooltips explicativos
- [ ] Testes de usabilidade

---

## 🚀 Benefícios Esperados

### Para Usuários
- ✅ Interface mais limpa e específica
- ✅ Menos campos irrelevantes
- ✅ Validação mais inteligente
- ✅ Experiência mais intuitiva

### Para Desenvolvedores
- ✅ Código mais organizado
- ✅ Fácil adição de novas categorias
- ✅ Validações centralizadas
- ✅ Melhor manutenibilidade

### Para o Negócio
- ✅ Dados mais precisos e estruturados
- ✅ Processo de cadastro mais eficiente
- ✅ Melhor categorização de produtos
- ✅ Relatórios mais detalhados

---

## 📝 Considerações Finais

Esta implementação criará um sistema flexível e extensível para cadastro de produtos, mantendo a simplicidade para o usuário final enquanto oferece poder e flexibilidade para desenvolvedores futuros. O sistema foi projetado para crescer com as necessidades do negócio, permitindo fácil adição de novas categorias e campos específicos conforme necessário.