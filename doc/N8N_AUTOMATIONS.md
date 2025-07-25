# Automações com n8n - Adega Manager

## Visão Geral

Este documento apresenta as funcionalidades sugeridas para automação usando n8n, substituindo o módulo de relatórios e adicionando novos recursos inteligentes ao sistema.

---

## 🔄 Automações de Estoque

### 1. Alertas de Estoque Baixo
**Trigger**: Produto com estoque <= estoque_mínimo
**Ações**:
- Webhook do Supabase → n8n
- Notificar por email/Slack
- Criar pedido automático para fornecedor
- Atualizar dashboard de alertas

```json
{
  "trigger": {
    "type": "webhook",
    "url": "https://n8n.empresa.com/webhook/low-stock"
  },
  "data": {
    "product_id": "uuid",
    "product_name": "Vinho Tinto 2020",
    "current_stock": 5,
    "minimum_stock": 10,
    "supplier": "Vinícola XYZ"
  }
}
```

### 2. Pedidos Automáticos para Fornecedores
**Trigger**: Estoque baixo + previsão de demanda
**Ações**:
- Calcular quantidade ideal com base no histórico
- Gerar pedido automático
- Enviar por email/API para fornecedor
- Notificar gerente para aprovação

### 3. Controle de Validade
**Trigger**: Cron job diário
**Ações**:
- Verificar produtos próximos ao vencimento
- Criar promoções automáticas
- Notificar equipe de vendas
- Gerar relatório de produtos vencidos

### 4. Análise de Giro de Estoque
**Trigger**: Cron job semanal
**Ações**:
- Calcular velocidade de vendas por produto
- Identificar produtos parados
- Sugerir promoções ou descontinuação
- Gerar relatório de performance

---

## 📊 Relatórios Automatizados

### 1. Relatório Diário de Vendas
**Trigger**: Cron job às 6h
**Ações**:
- Coletar dados de vendas do dia anterior
- Gerar PDF com gráficos
- Enviar por email para gerência
- Postar resumo no Slack

**Conteúdo**:
- Total de vendas
- Produtos mais vendidos
- Vendedores top
- Comparativo com dias anteriores

### 2. Relatório Semanal de Performance
**Trigger**: Cron job segunda-feira 8h
**Ações**:
- Análise completa da semana
- Métricas de estoque
- Performance de vendedores
- Análise de clientes

### 3. Relatório Mensal de Clientes
**Trigger**: Primeiro dia do mês
**Ações**:
- Segmentação atualizada
- Análise de LTV
- Clientes em risco
- Oportunidades de upsell

### 4. Dashboard em Tempo Real
**Trigger**: Webhook contínuo
**Ações**:
- Atualizar métricas em tempo real
- Enviar dados para Grafana/Tableau
- Alertas de anomalias
- Integração com TVs/monitores

---

## 🎯 Automações de CRM

### 1. Campanhas de Reativação
**Trigger**: Cliente inativo por 30 dias
**Ações**:
- Identificar clientes inativos
- Segmentar por histórico de compras
- Criar campanha personalizada
- Enviar via email/WhatsApp

**Exemplo de Mensagem**:
```
Olá [Nome],

Sentimos sua falta! Que tal voltar a explorar nossos vinhos?

Oferta especial: 15% OFF em sua categoria favorita ([Categoria])

Válido até [Data] | Use código: VOLTA15
```

### 2. Campanhas de Aniversário
**Trigger**: 7 dias antes do aniversário
**Ações**:
- Identificar aniversariantes
- Criar cupom personalizado
- Enviar mensagem de parabéns
- Acompanhar conversão

### 3. Carrinho Abandonado
**Trigger**: Venda iniciada mas não finalizada
**Ações**:
- Aguardar 30 minutos
- Enviar lembrete via WhatsApp
- Oferecer desconto progressivo
- Notificar vendedor para contato

### 4. Segmentação Dinâmica
**Trigger**: Após cada venda
**Ações**:
- Recalcular segmento do cliente
- Atualizar tags e categorias
- Ajustar campanhas ativas
- Notificar mudanças significativas

### 5. Análise de Comportamento
**Trigger**: Cron job semanal
**Ações**:
- Analisar padrões de compra
- Identificar produtos complementares
- Sugerir bundles personalizados
- Criar insights automáticos

---

## 💰 Automações Financeiras

### 1. Cobrança Automática
**Trigger**: Venda com prazo vencido
**Ações**:
- Enviar lembrete educado
- Escalar para cobrança após 3 dias
- Notificar gerente após 7 dias
- Atualizar status do cliente

### 2. Conciliação Bancária
**Trigger**: Webhook do banco/gateway
**Ações**:
- Fazer match com vendas pendentes
- Atualizar status de pagamento
- Notificar discrepâncias
- Gerar relatório de conciliação

### 3. Fluxo de Caixa
**Trigger**: Diário às 9h
**Ações**:
- Calcular entrada/saída
- Projetar próximos 30 dias
- Alertar sobre problemas de fluxo
- Gerar dashboard financeiro

### 4. Alertas de Inadimplência
**Trigger**: Cliente com 2+ pagamentos atrasados
**Ações**:
- Classificar risco de inadimplência
- Bloquear novas vendas a prazo
- Notificar gerente
- Iniciar processo de cobrança

---

## 📱 Integrações e Comunicação

### 1. WhatsApp Business
**Funcionalidades**:
- Confirmação automática de pedidos
- Status de entrega
- Lembretes de cobrança
- Campanhas promocionais
- Suporte automatizado

**Exemplo de Fluxo**:
```
Venda Concluída → n8n → WhatsApp API
"Olá [Nome]! Seu pedido #[ID] foi confirmado.
Produtos: [Lista]
Total: R$ [Valor]
Entrega prevista: [Data]"
```

### 2. Email Marketing
**Funcionalidades**:
- Newsletters automáticas
- Campanhas segmentadas
- Carrinho abandonado
- Produtos recomendados
- Eventos e degustações

### 3. SMS Marketing
**Funcionalidades**:
- Ofertas relâmpago
- Lembretes de entrega
- Confirmação de pagamento
- Alertas de promoções
- Pesquisas de satisfação

### 4. Integração com Slack/Teams
**Funcionalidades**:
- Alertas de vendas importantes
- Notificações de estoque
- Relatórios diários
- Alertas de sistema
- Métricas em tempo real

---

## 🚚 Automações de Delivery

### 1. Otimização de Rotas
**Trigger**: Novas entregas agendadas
**Ações**:
- Calcular rota mais eficiente
- Considerar trânsito em tempo real
- Notificar entregador
- Estimar tempo de entrega

### 2. Tracking Automático
**Trigger**: Saída para entrega
**Ações**:
- Enviar link de rastreamento
- Atualizar status automaticamente
- Notificar atrasos
- Confirmar entrega

### 3. Notificações de Entrega
**Trigger**: Diferentes status
**Ações**:
- Saiu para entrega
- Chegando em 10 minutos
- Entregue com sucesso
- Problema na entrega

### 4. Avaliação Automática
**Trigger**: 2 horas após entrega
**Ações**:
- Enviar pesquisa de satisfação
- Processar feedback
- Notificar problemas
- Atualizar rating do entregador

---

## 📈 Analytics e BI

### 1. Dashboard Executivo
**Funcionalidades**:
- KPIs em tempo real
- Métricas de crescimento
- Análise de tendências
- Comparativos históricos
- Alertas de performance

### 2. Análise Preditiva
**Funcionalidades**:
- Previsão de vendas
- Demanda de produtos
- Comportamento de clientes
- Tendências de mercado
- Otimização de preços

### 3. Alertas de Anomalias
**Funcionalidades**:
- Detecção de padrões anômalos
- Queda súbita de vendas
- Picos de demanda
- Problemas de qualidade
- Fraudes potenciais

### 4. Benchmarking
**Funcionalidades**:
- Comparação com períodos anteriores
- Análise de sazonalidade
- Performance por categoria
- Eficiência de campanhas
- ROI de investimentos

---

## 🛠️ Implementação Técnica

### 1. Webhooks do Supabase
```sql
-- Trigger para notificar n8n sobre vendas
CREATE OR REPLACE FUNCTION notify_sale_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('n8n_sale_webhook', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sale_webhook_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION notify_sale_webhook();
```

### 2. APIs para n8n
```typescript
// Endpoint para n8n acessar dados
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  switch (type) {
    case 'sales':
      return await getSalesData();
    case 'customers':
      return await getCustomersData();
    case 'inventory':
      return await getInventoryData();
    default:
      return new Response('Invalid type', { status: 400 });
  }
}
```

### 3. Estrutura de Dados
```json
{
  "event": "sale_completed",
  "timestamp": "2025-07-16T10:00:00Z",
  "data": {
    "sale_id": "uuid",
    "customer_id": "uuid",
    "total_amount": 150.00,
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "price": 75.00
      }
    ]
  }
}
```

---

## 🔧 Configuração e Monitoramento

### 1. Setup Inicial
1. **Instalar n8n** (self-hosted ou cloud)
2. **Configurar webhooks** no Supabase
3. **Criar workflows** básicos
4. **Testar integrações**
5. **Configurar monitoramento**

### 2. Monitoramento
- **Logs de execução** de workflows
- **Métricas de performance**
- **Alertas de falha**
- **Dashboard de status**
- **Relatórios de uso**

### 3. Manutenção
- **Backup de workflows**
- **Versionamento de automações**
- **Testes regulares**
- **Otimização de performance**
- **Documentação atualizada**

---

## 📊 Métricas de Sucesso

### 1. Operacionais
- **Tempo de resposta** das automações
- **Taxa de sucesso** dos workflows
- **Número de erros** por período
- **Uptime** do sistema
- **Performance** das integrações

### 2. Negócio
- **Aumento de vendas** via automações
- **Redução de estoque** parado
- **Melhoria na satisfação** do cliente
- **Eficiência operacional**
- **ROI das automações**

### 3. Clientes
- **Taxa de engajamento** em campanhas
- **Tempo de resposta** a problemas
- **Satisfação geral**
- **Retenção de clientes**
- **Valor médio** de compras

---

## 🚀 Próximos Passos

### Fase 1 - Fundação (Mês 1)
1. **Configurar n8n** e infraestrutura
2. **Implementar webhooks** básicos
3. **Criar primeiros workflows** (estoque, vendas)
4. **Testar integrações** principais

### Fase 2 - CRM (Mês 2)
1. **Automações de cliente** (reativação, aniversário)
2. **Campanhas segmentadas**
3. **WhatsApp Business** integração
4. **Análise de comportamento**

### Fase 3 - Avançado (Mês 3)
1. **Análise preditiva**
2. **Optimização de entregas**
3. **Dashboard executivo**
4. **Integrações complexas**

### Fase 4 - Otimização (Mês 4+)
1. **Machine Learning** para previsões
2. **Automações personalizadas**
3. **Escalabilidade**
4. **Novas integrações**

---

Este documento serve como guia para implementar um sistema de automações robusto e flexível, substituindo o módulo de relatórios por uma solução mais poderosa e versátil.