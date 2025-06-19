# Módulo Estoque - Plano de Melhorias

> **Criado em 18/06/2025** – Documento inicial do módulo de Estoque.

## Visão Geral

O módulo de Estoque é responsável por manter a acurácia dos níveis de inventário, prever demanda e garantir que produtos estejam disponíveis na hora certa, minimizando rupturas e excessos.

## Estado Atual

- Controle de quantidade em `products.stock_quantity` gerenciado automaticamente por triggers de banco
- Ajuste de estoque feito via cadeia de triggers (`sale_items` ➜ `inventory_movements` ➜ `adjust_product_stock`)
- Registro histórico completo em `inventory_movements` (entradas, saídas, devoluções, fiado)
- Alertas automáticos de reposição em produção

## Melhorias Implementadas (Sprint atual)

1. **Estrutura de Lotes e Validade**
   - Tabela `batches` com `lot_code`, `expiry_date`, `quantity`
   - Triggers para baixar primeiro o lote com menor validade (FIFO)
2. **Alertas de Reposição**
   - Tabela `stock_alerts` e função Edge que dispara notificação quando `stock < min_stock`
   - Integração com `NotificationBell`
3. **Previsão de Demanda (MVP)**
   - Job semanal (Supabase cron) que calcula média móvel de vendas
   - Campo `forecasted_demand` salvo em `products`

## Roadmap Próximo Trimestre

| Sprint | Item | Descrição |
|--------|------|-----------|
| Jul/25 | Movimentações | Registrar entradas, saídas, ajustes e transferências (ver `MOVIMENTACOES.md`) |
| Ago/25 | Integração Fornecedores | Webhook para confirmação automática de pedido |
| Set/25 | Planejamento de Compra | Algoritmo de EOQ & reabastecimento automático |

## Orientações para Desenvolvedores

1. **Performance**
   - Indexe `product_id` e `expiry_date` em `batches`
   - Utilize `bulk upsert` para entradas grandes
2. **Consistência**
   - Envolva baixas de estoque em transações
   - Registre **sempre** em `inventory_movements`; funções SQL e triggers já fazem isso automaticamente
3. **Testes**
   - Crie testes de stress simulando 100 vendas simultâneas
   - Use PGTap para validar triggers FIFO
4. **Observabilidade**
   - Loggue alertas em `logs.stock`
   - Grafana + Prometheus para monitorar nível de estoque crítico

## Atualizações

- **2025-06-18 22:40**: Documentação ajustada para refletir triggers de estoque e tabela `inventory_movements`.


- **18/06/2025**: Documento criado, definido escopo inicial e melhorias da sprint corrente.
