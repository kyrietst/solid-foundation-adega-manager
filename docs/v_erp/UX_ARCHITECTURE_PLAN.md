# Plano de Reestruturação de UX e System Design

> [!NOTE]
> Este documento reflete a análise de arquitetura focada em **Simplificação
> (MVP)** e **Redução de Carga Cognitiva**. Status: **Aguardando Aprovação**.

## 1. Nova Proposta de Navegação (Sidebar)

Atualmente a Sidebar possui 13 itens em lista plana, misturando operacional,
gerencial e administrativo. Proponho o agrupamento em **4 Contextos**:

| Grupo Sugerido             | Módulos Contidos                                                                                                              | Justificativa                                                      |
| :------------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **Frente de Loja 🏪**      | • **Vendas** (`/sales`)<br>• **Delivery** (`/delivery`)<br>• **Clientes** (`/customers`)                                      | Operação diária e venda rápida. Foco total em agilidade.           |
| **Estoque & Compras 📦**   | • **Estoque** (`/inventory`)<br>• **Movimentações** (`/movements`)<br>• **Fornecedores** (`/suppliers`)                       | Gestão de input de mercadorias e controle de inventário.           |
| **Gestão & Financeiro 💰** | • **Despesas** (`/expenses`)<br>• **Relatórios** (`/reports`)<br>• **Fiscal** (Novo Módulo)<br>• **Marketing** (`/marketing`) | Backoffice e análise estratégica. Acesso restrito (Manager/Admin). |
| **Sistema ⚙️**             | • **Usuários** (`/users`)<br>• **Logs** (`/activities`)<br>• **Configurações** (Novo Módulo)                                  | Administração técnica e auditoria.                                 |

### Ação Recomendada:

1. **Refatorar `Sidebar.tsx`**: Implementar componentes de `Accordion` ou
   `Collapsible` para os grupos.
2. **Dashboard (`/dashboard`)**: Manter fixo no topo, fora dos grupos.

---

## 2. Simplificação do CRM (Corte de Gordura)

A análise da pasta `src/features/customers/components` revelou componentes de
alta complexidade ("Overengineering") desnecessários para o momento MVP.

### Auditoria do `CustomerProfile.tsx` (6 Abas Atuais):

| Aba Atual         | Status     | Ação Proposta                                                          | Motivo                                |
| :---------------- | :--------- | :--------------------------------------------------------------------- | :------------------------------------ |
| **Overview**      | ✅ Manter  | **Simplificar**. Focar em dados cadastrais e LTV básico.               | Essencial.                            |
| **Purchases**     | ✅ Manter  | **Manter**. Histórico financeiro é core.                               | Essencial para vendas.                |
| **Communication** | ❌ Remover | **Ocultar**. "Centro de comunicação" (WhatsApp/Email integrados) é V2. | Alta complexidade, pouco uso inicial. |
| **Insights (IA)** | ❌ Remover | **Ocultar**. Análises preditivas SSoT v3.1 são overkill agora.         | Excesso de informação para leigo.     |
| **Actions**       | ❌ Remover | **Ocultar**. "Revenue Intelligence Center" é feature avançada.         | Reduzir ruído visual.                 |
| **Historical**    | ⚠️ Revisar | **Manter (Admin Only)**. Importação de legados.                        | Útil apenas para migração.            |

### Arquivos Candidatos à Remoção ("Dead Code" Logico):

- `AutomationCenter.tsx`
- `DataQualityDashboard.tsx`
- `DataQualityAlerts.tsx`
- `N8NPlaceholder.tsx` (Integrações complexas agora não são foco)

---

## 3. Padronização Visual (Modals)

Encontramos uma "Matrioska" de abstrações de modais que dificulta a manutenção e
confunde a UX.

- **Padrão Atual (Caótico):**
  - `BaseModal`: Wrapper simples do Dialog.
  - `EnhancedBaseModal`: Wrapper do BaseModal com loadings.
  - `SuperModal`: Wrapper do EnhancedBaseModal com Form + Zod + DebugPanel.
  - `Dialog` (Primitive): Uso direto em alguns lugares.
  - `Sheet` (Primitive): Uso esporádico.

- **Padrão Proposto (Vencedor):**

| Tipo de Interação        | Componente Padrão                 | Exemplo de Uso                                           |
| :----------------------- | :-------------------------------- | :------------------------------------------------------- |
| **Edições Complexas**    | **`Side Sheet` (Gaveta Lateral)** | Criar/Editar Produto, Editar Cliente, Detalhes de Venda. |
| **Confirmações/Alertas** | **`Dialog` (Simples)**            | "Deseja excluir?", Aviso de Erro, Seleção Rápida.        |

### Justificativa do `Side Sheet`:

Para formulários longos (como Produto e Cliente), o Modal central corta o
contexto da tela de fundo e exige scroll vertical ruim. O **Side Sheet** permite
scroll nativo, mantém o contexto visível e é mais amigável em Mobile.

### Plano de Ação:

1. **Congelar `SuperModal`**: Não criar novos usos.
2. **Adotar `Sheet`** para o formulário de Clientes (`CustomerForm`) na
   refatoração.
3. **Adotar `Dialog`** apenas para `DeleteCustomerModal`.

---

**Próximos Passos (Aprovação):**

1. Aplicar grupos na Sidebar.
2. Limpar abas do `CustomerProfile`.
3. Converter `EditCustomerModal` para `Sheet`.
