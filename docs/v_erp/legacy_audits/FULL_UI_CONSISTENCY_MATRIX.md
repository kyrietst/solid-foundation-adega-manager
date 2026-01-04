# Matriz de Consistência UI/UX Global (13 Módulos)

**Data:** 04/01/2026 **Status:** 🔴 CRÍTICO - AÇÃO NECESSÁRIA **Autor:**
Antigravity (Tech Lead Sênior)

Esta matriz cobre 100% dos módulos visíveis na Sidebar, identificando desvios do
padrão "Enterprise" exigido.

| #      | Módulo (Sidebar)   | Status | Termo "Amador" Encontrado         | Correção ERP Sugerida                            | Arquivo Alvo             |
| :----- | :----------------- | :----- | :-------------------------------- | :----------------------------------------------- | :----------------------- |
| **01** | **Dashboard**      | 🟡     | "Olá, [User]"                     | **"Painel de Controle / Visão Geral"**           | `AppDashboard.tsx`       |
| **02** | **Vendas (PDV)**   | 🟢     | (Padronizado na Fase 1)           | -                                                | -                        |
| **03** | **Clientes**       | 🔴     | "Nome Completo", "Apelido", "Zap" | **"Razão Social", "Nome Fantasia", "WhatsApp"**  | `CustomerForm.tsx`       |
| **04** | **Produtos**       | 🟢     | (Padronizado na Fase 1)           | -                                                | -                        |
| **05** | **Estoque/Mov.**   | 🔴     | "Entrou", "Saiu", "Motivo"        | **"Entrada", "Saída", "Natureza da Operação"**   | `MovementsTable.tsx`     |
| **06** | **Delivery**       | 🔴     | "Motoqueiro", "Saiu pra entrega"  | **"Logística/Entregador", "Em Rota de Entrega"** | `DeliveryOrderCard.tsx`  |
| **07** | **Fornecedores**   | 🔴     | "Pessoa de Contato"               | **"Representante Comercial"**                    | `SupplierForm.tsx`       |
| **08** | **Despesas**       | 🟡     | Botão "Nova Despesa" (Ícone Plus) | **"Lançar Despesa"**                             | `ExpensesTab.tsx`        |
| **09** | **Fiscal**         | 🟢     | (Padronizado na Fase 1)           | -                                                | -                        |
| **10** | **Relatórios**     | 🟡     | Títulos Genéricos                 | **"DRE Gerencial", "Curva ABC de Produtos"**     | `AdvancedReports.tsx`    |
| **11** | **Marketing**      | 🔴     | "Lucro"                           | **"Margem de Contribuição"**                     | `ProfitabilityTable.tsx` |
| **12** | **Equipe (Users)** | 🔴     | "Criar conta", "Role"             | **"Cadastrar Colaborador", "Perfil de Acesso"**  | `UserManagement.tsx`     |
| **13** | **Configurações**  | 🟡     | "Dados da Loja"                   | **"Parâmetros do Emitente"**                     | `StoreSettings.tsx`      |

## Plano de Ação (Banho de Loja)

1. **Imediato (Esta Sessão):** Corrigir terminologia em **Clientes, Delivery, e
   Movimentações** (Os mais críticos/visíveis).
2. **Segunda Onda:** Ajustar Relatórios e Marketing para linguagem contábil.
3. **Finalização:** Refinar Dashboard e Configurações.

---

**Status da Auditoria:** ✅ MATRIX COMPLETA GERADA
