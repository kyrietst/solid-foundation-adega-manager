# Formulário Dinâmico de Produto - História 1.2

## Funcionalidade dos Campos Dinâmicos

Este documento descreve a implementação dos campos dinâmicos no formulário de produto, conforme especificado na História 1.2.

### Comportamento por Categoria

#### 📋 **Categorias "Bebidas"**
As seguintes categorias são consideradas bebidas e mostram o campo **"Volume (ml)"**:

- Vinho Tinto
- Vinho Branco  
- Vinho Rosé
- Espumante
- Champagne
- Whisky
- Vodka
- Gin
- Rum
- Cachaça
- Cerveja
- Licor
- Conhaque
- Aperitivo

**Comportamento:**
- Campo **obrigatório** "Volume (ml)" 
- Placeholder: "Ex: 750"
- Unidade mostrada: "ml"
- `measurement_type`: "Volume"
- `measurement_value`: valor digitado 
- `volume_ml`: mesmo valor (para compatibilidade)

#### 📦 **Outras Categorias**
A categoria "Outros" e futuras categorias não-bebidas mostram o campo **"Unidade de Medida"**:

**Comportamento:**
- Campo **opcional** "Unidade de Medida"
- Placeholder: "Ex: 1, 12, 24" 
- Unidade mostrada: "unidades"
- `measurement_type`: "Unidade"
- `measurement_value`: valor digitado
- `volume_ml`: não preenchido

### Implementação Técnica

#### Componentes

1. **`DynamicMeasurementField`** - Componente principal que adapta-se à categoria
2. **`categoryUtils.ts`** - Utilitários para lógica de categorias
3. **`ProductBasicInfoCard`** - Integração no formulário principal

#### Lógica de Validação

```typescript
// Para bebidas - campo obrigatório
if (isBeverageCategory(category) && !volume_ml) {
  errors.push('Volume é obrigatório para bebidas');
}

// Para outras categorias - validação opcional
if (measurement_value && measurement_value.trim() === '') {
  errors.push('Valor de medição não pode estar vazio');
}
```

#### Estrutura de Dados

```typescript
interface ProductFormData {
  // ... outros campos
  measurement_type?: string;    // "Volume" | "Unidade"
  measurement_value?: string;   // Valor digitado pelo usuário
  volume_ml?: number;          // Para compatibilidade (apenas bebidas)
}
```

### Fluxo de Funcionamento

1. **Usuário seleciona categoria** → Componente detecta se é bebida
2. **Campo é renderizado** → Volume (bebidas) ou Unidade (outros)
3. **Usuário digita valor** → Campos são preenchidos automaticamente
4. **Validação** → Obrigatório para bebidas, opcional para outros
5. **Envio** → Dados salvos com `measurement_type` e `measurement_value`

### Casos de Uso

#### Exemplo 1: Vinho Tinto (Bebida)
```
Categoria: "Vinho Tinto"
Campo mostrado: "Volume (ml)" *
Usuário digita: 750
Resultado: 
- measurement_type: "Volume"
- measurement_value: "750"  
- volume_ml: 750
```

#### Exemplo 2: Outros (Não-bebida)
```
Categoria: "Outros"
Campo mostrado: "Unidade de Medida"
Usuário digita: 12
Resultado:
- measurement_type: "Unidade"
- measurement_value: "12"
- volume_ml: null
```

### Extensibilidade

Para adicionar novas categorias como bebidas, edite o array `BEVERAGE_CATEGORIES` em `categoryUtils.ts`:

```typescript
export const BEVERAGE_CATEGORIES: readonly WineCategory[] = [
  // ... categorias existentes
  'Nova Categoria Bebida'
] as const;
```