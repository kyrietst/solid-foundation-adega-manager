# 📊 Relatório de Maturidade ERP (Full Stack Gap Analysis)

**Data:** 04/01/2026 **Status:** Auditoria "Pente Fino" **Classificação Atual:**
🚧 **Pré-ERP** (Evoluído, mas com lacunas fiscais críticas)

## 1. Dados e Estrutura (Supabase)

| Entidade         | Campo/Recurso                   | Status         | Risco Fiscal  | Ação Necessária                                                                                                   |
| :--------------- | :------------------------------ | :------------- | :------------ | :---------------------------------------------------------------------------------------------------------------- |
| **`products`**   | `cest`, `ncm`, `origin`, `cfop` | ✅ Existem     | Baixo         | Popular dados (muitos nulos)                                                                                      |
| **`sales`**      | `serie`, `numero_nota`          | ❌ Ausentes    | Alto          | Criar colunas sequenciais fiscais                                                                                 |
| **`sales`**      | `xml_url`, `protocol_auth`      | 🟡 Parcial     | Médio         | Existe `invoice_url` (PDF). XML deve ser salvo à parte.                                                           |
| **`sale_items`** | **`fiscal_snapshot`**           | ❌ **CRÍTICO** | **Altíssimo** | O RPC `process_sale` **NÃO GRAVA** snapshot fiscal dos itens. Se o NCM do produto mudar, a venda antiga corrompe. |
| **`suppliers`**  | `ie`, `indicador_ie`            | ❌ Ausentes    | Médio         | Criar para emissão de nota de entrada/devolução.                                                                  |
| **`products`**   | `deleted_at` (Soft Delete)      | ✅ Existe      | Baixo         | Lógica de exclusão lógica implementada.                                                                           |

## 2. Regras de Negócio (Backend - `process_sale`)

### 2.1. Tratamento de Descontos (🚨 Ponto de Atenção)

- **Atual:** O sistema aceita `p_discount_amount` global no cabeçalho da venda.
- **Problema ERP:** O RPC **não rateia** esse desconto nos itens (`sale_items`).
- **Consequência:** No XML da NF-e, se houver desconto global sem rateio item a
  item (tag `<vDesc>`), a validação de totais da SEFAZ (`vProd` - `vDesc`) pode
  falhar ou gerar inconsistência contábil.
- **Ação:** Implementar lógica de rateio proporcional (`vDesc` por item) dentro
  do RPC.

### 2.2. Integridade de Estoque

- **Atual:** `create_inventory_movement` é chamado.
- **Gap:** Não foi identificada trava explícita de "Estoque Negativo" no RPC. Se
  o frontend permitir, o backend processa.
- **Recomendação:** Adicionar `IF new_stock < 0 THEN RAISE EXCEPTION`
  (Configurável por flag).

### 2.3. Snapshot Fiscal ("Foto da Venda")

- **Situação:** A tabela `sale_items` grava apenas `product_id`.
- **Regra ERP:** Uma venda realizada em 2024 com NCM X deve permanecer com NCM X
  mesmo se o produto mudar para NCM Y em 2025.
- **Falha:** O RPC atual busca os dados do produto em tempo real (JOIN) para
  emitir a nota, mas não persiste os dados fiscais _do momento da venda_ no
  banco.

## 3. Interfaces Críticas (Frontend)

- [ ] **Cadastro de Fornecedor:** Faltam campos de Inscrição Estadual (IE) e
      Indicador de IE.
- [ ] **Configurações da Loja (Emitente):** Não existe interface no Admin para
      definir CNPJ, Endereço Fiscal e CRT da Adega (Atualmente hardcoded ou via
      banco).
- [ ] **Feedback de Validação:** O usuário não é avisado sobre produtos com
      cadastro fiscal incompleto (NCM/EAN) antes de tentar a venda.

## 4. Veredito Final

**Sistema classificado como "Pré-ERP".** Possui estrutura sólida de vendas e
estoque, mas falha em princípios contábeis imutáveis (Snapshot) e requisitos
finos de tributação (Rateio de Descontos).

**Prioridades de Correção (Pós-Freeze):**

1. **Imediato:** Implementar coluna JSONB `fiscal_snapshot` em `sale_items` e
   preencher no RPC.
2. **Curto Prazo:** Criar tabela/interface `store_settings` completa.
3. **Médio Prazo:** Refatorar RPC para rateio de descontos.
