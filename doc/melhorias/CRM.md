# Módulo CRM - Documentação Técnica

## Visão Geral

O módulo CRM (Customer Relationship Management) do Adega Manager foi desenvolvido para transformar a gestão de clientes em um sistema completo e integrado, permitindo não apenas o cadastro de dados básicos, mas também o rastreamento de interações, análise de comportamentos de compra, segmentação automática e identificação de oportunidades de negócio.

## Arquitetura

### Estrutura de Componentes

```
src/
├── components/
│   ├── Customers.tsx              # Componente principal do CRM
│   ├── ui/
│       ├── profile-completeness.tsx  # Indicador de completude de perfil
│       ├── customer-detail.tsx       # Detalhes completos do cliente
│       ├── customer-list.tsx         # Lista de clientes
│       ├── customer-stats.tsx        # Estatísticas gerais
│       ├── customer-segments.tsx     # Visualização de segmentação
│       ├── customer-activity.tsx     # Atividades recentes
│       ├── customer-trends.tsx       # Tendências de compra
│       └── customer-opportunities.tsx # Oportunidades de negócio
├── hooks/
│   └── use-crm.ts                  # Hooks para interação com o banco de dados
```

### Modelo de Dados

#### Tabelas Principais

1. **customers**
   - Campos básicos: id, name, email, phone, address
   - Campos avançados: 
     - birthday
     - contact_preference
     - contact_permission
     - first_purchase_date
     - last_purchase_date
     - purchase_frequency
     - lifetime_value
     - favorite_category
     - favorite_product
     - segment

2. **customer_insights**
   - id
   - customer_id
   - insight_type (preference, pattern, opportunity, risk)
   - insight_value
   - confidence
   - is_active
   - created_at

3. **customer_interactions**
   - id
   - customer_id
   - interaction_type
   - description
   - associated_sale_id
   - created_by
   - created_at

4. **automation_logs**
   - id
   - customer_id
   - workflow_id
   - workflow_name
   - trigger_event
   - result
   - details (JSONB)
   - created_at

### Relações e Integridade

- Os clientes estão associados a vendas (sales) através do customer_id
- Os insights, interações e logs de automação estão vinculados a clientes específicos
- O campo favorite_product faz referência à tabela products

## Funcionalidades Implementadas

### 1. Gestão de Perfil de Cliente

- **Indicador de Completude**: Visualização do progresso de preenchimento do perfil com sugestões de melhorias
- **Detalhes Expandidos**: Interface com abas para visão geral, histórico de compras, insights e interações
- **Formulário Avançado**: Coleta de dados detalhados como preferências, aniversário e permissões de contato

### 2. Segmentação Automática

- **Segmentos Dinâmicos**: Categorização automática de clientes em VIP, Regular, Novo, Inativo, Em risco
- **Trigger de Database**: Atualização automática do segmento após cada compra
- **Visualização Gráfica**: Gráfico de pizza interativo mostrando distribuição por segmento

### 3. Registro de Interações

- **Múltiplos Tipos**: Suporte para notas, chamadas, emails e reclamações
- **Timeline Visual**: Visualização cronológica das interações
- **Formulário Integrado**: Adição rápida de interações a partir da tela de detalhes

### 4. Sistema de Insights

- **Geração Automática**: Insights gerados automaticamente com base em padrões de compra
- **Categorização**: Preferências, padrões, oportunidades e riscos
- **Nível de Confiança**: Cada insight possui um índice de confiabilidade

### 5. Análise e Visualização

- **Dashboard Analítico**: Visualização gráfica de métricas e segmentos
- **Tendências de Vendas**: Gráficos de linha mostrando evolução de vendas e ticket médio
- **Receita por Segmento**: Análise de contribuição financeira por segmento

### 6. Detecção de Oportunidades

- **Identificação Automática**: Mapeamento de oportunidades de cross-sell e up-sell
- **Priorização**: Ordenação por tipo e confiabilidade
- **Ações Rápidas**: Interface para planejamento de ações a partir de oportunidades

### 7. Automação de Enriquecimento

- **Triggers de Banco**: Atualização automática do perfil após vendas
- **Detecção de Padrões**: Identificação de categoria favorita, produto favorito e frequência de compra
- **Logs de Automação**: Registro de todas as ações automáticas para auditoria

## Implementação Técnica

### Hooks Principais

#### useCustomers
```typescript
// Hook para obter todos os clientes
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as CustomerProfile[];
    }
  });
};
```

#### useCustomerInsights
```typescript
// Hook para obter insights de um cliente
export const useCustomerInsights = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-insights', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_insights')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CustomerInsight[];
    },
    enabled: !!customerId
  });
};
```

#### useProfileCompleteness
```typescript
// Hook para calcular a completude do perfil do cliente
export const useProfileCompleteness = (customer: CustomerProfile | undefined) => {
  const [completeness, setCompleteness] = useState({
    score: 0,
    suggestions: [] as string[]
  });
  
  useEffect(() => {
    if (!customer) return;
    
    const fields = [
      { name: 'name', label: 'Nome', weight: 15, required: true },
      { name: 'phone', label: 'Telefone', weight: 15, required: true },
      { name: 'email', label: 'Email', weight: 10, required: false },
      { name: 'address', label: 'Endereço', weight: 10, required: false },
      { name: 'birthday', label: 'Data de aniversário', weight: 10, required: false },
      { name: 'contact_preference', label: 'Preferência de contato', weight: 10, required: false },
      { name: 'contact_permission', label: 'Permissão de contato', weight: 15, required: true },
      { name: 'notes', label: 'Observações', weight: 5, required: false },
    ];
    
    let score = 0;
    const suggestions: string[] = [];
    
    fields.forEach(field => {
      if (customer[field.name as keyof CustomerProfile]) {
        score += field.weight;
      } else if (field.required) {
        suggestions.push(`Adicionar ${field.label}`);
      } else {
        suggestions.push(`Completar ${field.label}`);
      }
    });
    
    // Limitar a 3 sugestões
    const topSuggestions = suggestions.slice(0, 3);
    
    setCompleteness({
      score,
      suggestions: topSuggestions
    });
  }, [customer]);
  
  return completeness;
};
```

### Automações de Banco de Dados

#### Trigger de Atualização de Cliente
```sql
-- Função para atualizar automaticamente os dados do cliente após uma venda
CREATE OR REPLACE FUNCTION public.update_customer_after_sale()
RETURNS TRIGGER AS $$
DECLARE
  total_purchases NUMERIC;
  most_purchased_category TEXT;
  most_purchased_product UUID;
  purchase_interval INTERVAL;
  purchase_frequency TEXT;
  customer_segment TEXT;
BEGIN
  -- Atualizar data da primeira compra se for null
  IF (SELECT first_purchase_date FROM customers WHERE id = NEW.customer_id) IS NULL THEN
    UPDATE customers SET first_purchase_date = NEW.created_at WHERE id = NEW.customer_id;
  END IF;
  
  -- Atualizar data da última compra
  UPDATE customers SET last_purchase_date = NEW.created_at WHERE id = NEW.customer_id;
  
  -- Calcular o valor total de compras do cliente
  SELECT COALESCE(SUM(total_amount), 0) INTO total_purchases 
  FROM sales 
  WHERE customer_id = NEW.customer_id AND status != 'cancelled';
  
  -- Atualizar lifetime_value
  UPDATE customers SET lifetime_value = total_purchases WHERE id = NEW.customer_id;
  
  -- Encontrar categoria mais comprada
  WITH product_categories AS (
    SELECT p.category, SUM(si.quantity) as total_qty
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    WHERE s.customer_id = NEW.customer_id AND s.status != 'cancelled'
    GROUP BY p.category
    ORDER BY total_qty DESC
    LIMIT 1
  )
  SELECT category INTO most_purchased_category FROM product_categories;
  
  -- Atualizar categoria favorita
  UPDATE customers SET favorite_category = most_purchased_category WHERE id = NEW.customer_id;
  
  -- [LÓGICA ADICIONAL DE SEGMENTAÇÃO E INSIGHTS]
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Guia de Desenvolvimento

### Adicionar Novo Tipo de Interação

1. **Atualizar Componente de Formulário**
   Adicione o novo tipo à lista de opções em `customer-detail.tsx`:

   ```tsx
   const interactionTypes = [
     { value: 'note', label: 'Anotação' },
     { value: 'call', label: 'Ligação' },
     { value: 'email', label: 'Email' },
     { value: 'complaint', label: 'Reclamação' },
     { value: 'seu_novo_tipo', label: 'Seu Novo Tipo' }
   ];
   ```

2. **Adicionar Ícone e Estilo**
   Em `customer-activity.tsx`, adicione lógica para o ícone e cores:

   ```tsx
   // Função para obter o ícone do tipo de interação
   const getInteractionIcon = (type: string) => {
     switch (type) {
       // Tipos existentes...
       case 'seu_novo_tipo':
         return <SeuIcone className="h-4 w-4 text-custom-color" />;
       default:
         return <MessageSquare className="h-4 w-4 text-gray-500" />;
     }
   };
   ```

3. **Atualizar Filtros de Interações**
   Se necessário, atualize os filtros de interações no componente `customer-detail.tsx`

### Criar Nova Visualização Analítica

1. **Criar Componente**
   Crie um novo componente em `src/components/ui/`

2. **Implementar Hook de Dados**
   Adicione um hook em `use-crm.ts` para obter os dados necessários

3. **Integrar no Dashboard**
   Adicione o componente na aba "Analytics" em `Customers.tsx`

### Modificar Segmentação de Clientes

Você pode ajustar a lógica de segmentação no trigger `update_customer_after_sale` no banco de dados:

```sql
-- Determinar segmento do cliente
SELECT 
  CASE 
    WHEN total_purchases > 1000 THEN 'VIP'
    WHEN total_purchases > 500 THEN 'Regular'
    WHEN NEW.created_at >= (NOW() - INTERVAL '30 days') AND (SELECT COUNT(*) FROM sales WHERE customer_id = NEW.customer_id) <= 2 THEN 'Novo'
    WHEN NEW.created_at < (NOW() - INTERVAL '90 days') THEN 'Inativo'
    ELSE 'Regular'
  END INTO customer_segment;
```

## Melhores Práticas

1. **Performance**
   - Use `useQuery` com chaves apropriadas para evitar consultas desnecessárias
   - Implemente paginação para listas grandes de clientes
   - Otimize consultas ao banco de dados com índices adequados

2. **Manutenção**
   - Mantenha a separação entre lógica de UI e lógica de negócios
   - Documente alterações em triggers e funções do banco de dados
   - Use tipos TypeScript para garantir consistência de dados

3. **Extensibilidade**
   - Adicione novos tipos de insights e segmentos sem quebrar a funcionalidade existente
   - Mantenha componentes pequenos e focados
   - Use hooks customizados para lógica reutilizável

## Próximos Passos e Melhorias Futuras

1. **Integração com Email Marketing**
   - Adicionar exportação de segmentos para ferramentas de email marketing
   - Implementar templates de email personalizados por segmento

2. **Sistema de Pontos e Fidelidade**
   - Desenvolver lógica de acumulação de pontos por compra
   - Implementar resgate de benefícios

3. **Automação de Campanhas**
   - Criar fluxos automáticos baseados em comportamento
   - Implementar notificações para oportunidades de venda

4. **Análise Preditiva**
   - Implementar algoritmos de previsão de LTV (Lifetime Value)
   - Desenvolver detecção de churn com alertas antecipados

5. **Integração com Módulo de Vendas**
   - Exibir insights e recomendações durante o checkout
   - Implementar sugestões de cross-selling baseadas no histórico

## Troubleshooting

### Problemas Comuns

1. **Segmento de Cliente Não Atualiza**
   - Verifique se o trigger está ativo na tabela de vendas
   - Confirme que a venda tem status 'completed'
   - Teste a função manualmente para verificar erros

2. **Gráficos Não Exibem Dados**
   - Verifique se há vendas associadas aos clientes
   - Confirme que os dados de vendas têm formato correto
   - Verifique erros de console relacionados à biblioteca Recharts

3. **Indicador de Completude Incorreto**
   - Verifique a lógica de pesos no hook useProfileCompleteness
   - Confirme que todos os campos estão sendo considerados
   - Teste com diferentes perfis para validar a pontuação

## Conclusão

O módulo CRM representa uma evolução significativa na gestão de clientes do Adega Manager, transformando dados básicos em insights acionáveis. Com segmentação automática, análise de tendências e identificação de oportunidades, o sistema permite uma abordagem personalizada para cada cliente, aumentando a retenção e o valor médio de vendas.