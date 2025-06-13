# Melhorias do Módulo Vendas

## Visão Geral

O módulo de Vendas é um componente crítico do Adega Manager, responsável pelo processamento de transações, gestão de carrinho e finalização de compras. As melhorias propostas visam otimizar o fluxo de vendas, aumentar a conversão e melhorar a experiência tanto para funcionários quanto para clientes.

## Estado Atual

Atualmente, o módulo de Vendas apresenta:
- Lista simples de produtos disponíveis
- Carrinho básico com adição/remoção de itens
- Cálculo manual de valores
- Processo de checkout simplificado
- Registro de vendas recentes em formato de tabela
- Sem integração com sistemas de pagamento
- Sem sistema de descontos ou promoções

## Melhorias Propostas

### 1. Processo de Checkout Otimizado

**Descrição:** Redesenhar o fluxo de checkout para torná-lo mais eficiente e intuitivo, reduzindo o tempo necessário para finalizar uma venda.

**Implementação:**
- Criar interface de checkout em etapas (wizard)
- Implementar pesquisa rápida de produtos por código, nome ou categoria
- Adicionar scanner de código de barras (para dispositivos com câmera)
- Criar atalhos de teclado para operações comuns

**Benefícios:**
- Redução do tempo médio de checkout
- Diminuição de erros operacionais
- Melhor experiência para funcionários
- Aumento na satisfação do cliente

### 2. Integração com Sistemas de Pagamento

**Descrição:** Implementar integração com gateways de pagamento para processar transações eletrônicas diretamente no sistema.

**Implementação:**
- Integrar com Mercado Pago, PagSeguro e/ou Stripe
- Implementar geração de QR Code para pagamentos via PIX
- Criar sistema de conciliação automática de pagamentos
- Desenvolver fluxo para pagamentos parciais ou divididos

**Métodos de pagamento a implementar:**
- Cartão de crédito/débito
- PIX
- Boleto bancário
- Carteira digital
- Crédito na loja

### 3. Descontos e Promoções Automatizadas

**Descrição:** Criar um sistema de regras para aplicação automática de descontos e promoções baseadas em diversos critérios.

**Implementação:**
- Desenvolver motor de regras configurável
- Criar interface para gerenciamento de promoções
- Implementar sistema de cupons com validação
- Adicionar suporte a descontos progressivos

**Tipos de promoções:**
- Compre X, leve Y
- Desconto por quantidade
- Desconto por valor total
- Promoções por categoria ou produto específico
- Promoções sazonais ou por tempo limitado
- Descontos para clientes VIP

### 4. Recomendação de Produtos Complementares

**Descrição:** Implementar sistema de recomendação que sugere produtos complementares durante o processo de venda.

**Implementação:**
- Desenvolver algoritmo de análise de cesta de compras
- Criar componente visual para exibição de sugestões
- Implementar rastreamento de eficácia das recomendações
- Integrar com histórico de compras do cliente

**Funcionalidades:**
- Sugestões baseadas em compras anteriores
- Produtos frequentemente comprados juntos
- Recomendações baseadas em sazonalidade
- Sugestões de upsell (versões premium)
- Combos personalizados

### 5. Histórico Detalhado de Vendas por Cliente

**Descrição:** Expandir o registro de vendas para incluir histórico detalhado por cliente, facilitando o atendimento personalizado e análises de comportamento.

**Implementação:**
- Criar visualização de histórico de compras por cliente
- Implementar filtros e buscas avançadas
- Desenvolver análise de padrões de compra
- Adicionar notas e tags para vendas específicas

**Informações a incluir:**
- Produtos mais comprados
- Frequência de compras
- Valor médio de compra
- Preferências identificadas
- Histórico de devoluções ou problemas
- Oportunidades de venda cruzada

## Arquitetura Técnica

### Componentes Front-end

```tsx
// Exemplo de componente de Checkout
const CheckoutWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [saleData, setSaleData] = useState<SaleData>({
    customer: null,
    items: [],
    paymentMethod: null,
    discount: 0,
    notes: ''
  });
  
  const steps = [
    { id: 1, title: 'Produtos' },
    { id: 2, title: 'Cliente' },
    { id: 3, title: 'Pagamento' },
    { id: 4, title: 'Confirmação' }
  ];
  
  const handleComplete = async () => {
    try {
      await processSale(saleData);
      toast.success('Venda finalizada com sucesso!');
      // Limpar e reiniciar
    } catch (error) {
      toast.error('Erro ao finalizar venda');
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-4">
      <StepIndicator steps={steps} currentStep={step} />
      
      {step === 1 && (
        <ProductSelection 
          onProductsSelected={(products) => {
            setSaleData({...saleData, items: products});
            setStep(2);
          }}
        />
      )}
      
      {step === 2 && (
        <CustomerSelection 
          onCustomerSelected={(customer) => {
            setSaleData({...saleData, customer});
            setStep(3);
          }}
        />
      )}
      
      {step === 3 && (
        <PaymentSelection 
          total={calculateTotal(saleData.items)}
          onPaymentSelected={(paymentDetails) => {
            setSaleData({...saleData, ...paymentDetails});
            setStep(4);
          }}
        />
      )}
      
      {step === 4 && (
        <OrderSummary 
          saleData={saleData}
          onConfirm={handleComplete}
          onEdit={(editStep) => setStep(editStep)}
        />
      )}
    </div>
  );
};

// Componente de recomendação de produtos
const ProductRecommendations: React.FC<{ 
  currentItems: CartItem[],
  customerId?: string
}> = ({ currentItems, customerId }) => {
  const { data: recommendations, isLoading } = useProductRecommendations(
    currentItems.map(item => item.id),
    customerId
  );
  
  if (isLoading || !recommendations?.length) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700">Recomendados para você</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {recommendations.map(product => (
          <RecommendationCard 
            key={product.id}
            product={product}
            onAdd={() => {/* adicionar ao carrinho */}}
          />
        ))}
      </div>
    </div>
  );
};
```

### Hooks e Serviços

```tsx
// Hook para recomendações de produtos
const useProductRecommendations = (
  productIds: string[],
  customerId?: string
) => {
  return useQuery({
    queryKey: ['recommendations', productIds, customerId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_product_recommendations',
        { 
          p_product_ids: productIds,
          p_customer_id: customerId || null
        }
      );
      
      if (error) throw error;
      return data;
    },
    enabled: productIds.length > 0
  });
};

// Serviço para processamento de vendas
const processSale = async (saleData: SaleData): Promise<string> => {
  // Validações
  if (!saleData.items.length) {
    throw new Error('Carrinho vazio');
  }
  
  // Processar pagamento se for eletrônico
  let paymentResult = null;
  if (saleData.paymentMethod.type === 'electronic') {
    paymentResult = await processPayment({
      amount: calculateTotal(saleData.items, saleData.discount),
      method: saleData.paymentMethod.provider,
      details: saleData.paymentMethod.details
    });
  }
  
  // Registrar venda no Supabase
  const { data, error } = await supabase.rpc(
    'process_sale',
    {
      p_customer_id: saleData.customer?.id || null,
      p_user_id: getCurrentUserId(),
      p_items: saleData.items,
      p_payment_method: saleData.paymentMethod.type,
      p_payment_details: paymentResult,
      p_discount: saleData.discount,
      p_notes: saleData.notes
    }
  );
  
  if (error) throw error;
  return data; // ID da venda
};
```

## Integrações com Backend

### Funções SQL para Processamento de Vendas

```sql
-- Função para processar venda completa com transação
CREATE OR REPLACE FUNCTION process_sale(
  p_customer_id UUID,
  p_user_id UUID,
  p_items JSONB,
  p_payment_method TEXT,
  p_payment_details JSONB DEFAULT NULL,
  p_discount NUMERIC DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sale_id UUID;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_unit_price NUMERIC;
  v_current_stock INT;
BEGIN
  -- Iniciar transação
  BEGIN
    -- Calcular valor total e validar estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_product_id := (v_item->>'id')::UUID;
      v_quantity := (v_item->>'quantity')::INT;
      v_unit_price := (v_item->>'price')::NUMERIC;
      
      -- Verificar estoque
      SELECT stock_quantity INTO v_current_stock
      FROM products
      WHERE id = v_product_id;
      
      IF v_current_stock < v_quantity THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto %', v_product_id;
      END IF;
      
      -- Atualizar valor total
      v_total_amount := v_total_amount + (v_quantity * v_unit_price);
    END LOOP;
    
    -- Aplicar desconto
    v_total_amount := v_total_amount - p_discount;
    
    -- Inserir venda
    INSERT INTO sales (
      customer_id,
      user_id,
      total_amount,
      payment_method,
      payment_details,
      discount_amount,
      notes,
      status
    ) VALUES (
      p_customer_id,
      p_user_id,
      v_total_amount,
      p_payment_method,
      p_payment_details,
      p_discount,
      p_notes,
      'completed'
    )
    RETURNING id INTO v_sale_id;
    
    -- Inserir itens da venda e atualizar estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_product_id := (v_item->>'id')::UUID;
      v_quantity := (v_item->>'quantity')::INT;
      v_unit_price := (v_item->>'price')::NUMERIC;
      
      -- Inserir item
      INSERT INTO sale_items (
        sale_id,
        product_id,
        quantity,
        unit_price
      ) VALUES (
        v_sale_id,
        v_product_id,
        v_quantity,
        v_unit_price
      );
      
      -- Atualizar estoque
      UPDATE products
      SET stock_quantity = stock_quantity - v_quantity
      WHERE id = v_product_id;
    END LOOP;
    
    -- Registrar no histórico do cliente se aplicável
    IF p_customer_id IS NOT NULL THEN
      INSERT INTO customer_history (
        customer_id,
        event_type,
        event_data
      ) VALUES (
        p_customer_id,
        'purchase',
        jsonb_build_object(
          'sale_id', v_sale_id,
          'amount', v_total_amount,
          'items_count', jsonb_array_length(p_items)
        )
      );
    END IF;
    
    RETURN v_sale_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$;

-- Função para recomendação de produtos
CREATE OR REPLACE FUNCTION get_product_recommendations(
  p_product_ids UUID[],
  p_customer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  image_url TEXT,
  relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  
  WITH customer_preferences AS (
    -- Produtos mais comprados pelo cliente
    SELECT 
      product_id,
      SUM(quantity) as total_purchased
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.customer_id = p_customer_id
    GROUP BY product_id
  ),
  
  basket_analysis AS (
    -- Produtos frequentemente comprados juntos
    SELECT 
      si2.product_id,
      COUNT(*) as frequency
    FROM sale_items si1
    JOIN sale_items si2 ON si1.sale_id = si2.sale_id AND si1.product_id != si2.product_id
    WHERE si1.product_id = ANY(p_product_ids)
    GROUP BY si2.product_id
  )
  
  SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    (
      COALESCE(ba.frequency, 0) * 0.7 + 
      COALESCE(cp.total_purchased, 0) * 0.3
    ) as relevance_score
  FROM products p
  LEFT JOIN basket_analysis ba ON p.id = ba.product_id
  LEFT JOIN customer_preferences cp ON p.id = cp.product_id
  WHERE 
    p.id <> ALL(p_product_ids) AND
    p.stock_quantity > 0
  ORDER BY relevance_score DESC
  LIMIT 6;
END;
$$;
```

### API Endpoints

Novos endpoints a serem implementados:
- `POST /api/sales/process` - Processa uma nova venda
- `GET /api/sales/customer/:id` - Retorna histórico de compras do cliente
- `GET /api/products/recommendations` - Retorna recomendações de produtos
- `GET /api/promotions/active` - Retorna promoções ativas
- `POST /api/promotions/apply` - Aplica promoção ou cupom ao carrinho

## Cronograma de Implementação

| Funcionalidade | Prioridade | Estimativa | Dependências |
|---------------|------------|------------|--------------|
| Checkout Otimizado | Alta | 3 semanas | - |
| Integração de Pagamentos | Alta | 4 semanas | Checkout Otimizado |
| Descontos e Promoções | Média | 3 semanas | - |
| Recomendação de Produtos | Baixa | 2 semanas | - |
| Histórico por Cliente | Média | 2 semanas | - |

## Métricas de Sucesso

Para avaliar o sucesso das melhorias, serão monitorados:

1. **Eficiência Operacional**
   - Tempo médio de checkout
   - Taxa de abandono de vendas
   - Erros durante o processo de venda

2. **Vendas**
   - Valor médio de venda
   - Taxa de conversão de recomendações
   - Efetividade de promoções
   - Vendas por método de pagamento

3. **Experiência do Usuário**
   - Feedback dos funcionários
   - Número de cliques para completar uma venda
   - Uso de recursos avançados

## Próximos Passos

1. Prototipar nova interface de checkout
2. Pesquisar e selecionar gateways de pagamento
3. Definir regras para o sistema de promoções
4. Implementar MVP do checkout otimizado
5. Testar com usuários reais e coletar feedback 