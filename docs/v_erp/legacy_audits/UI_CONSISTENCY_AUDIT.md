# Relatório de Consistência UI/UX Global

**Data:** 04/01/2026 **Status:** 🚨 AÇÃO IMEDIATA REQUERIDA **Autor:**
Antigravity (Tech Lead Sênior)

Este relatório identifica desvios críticos de consistência visual e
terminológica que comprometem a percepção profissional do "AdegaManager". O foco
saiu do "Fiscal" e varreu os módulos periféricos.

## 1. Módulos & Componentes Críticos

| Módulo/Componente | O que está "Amador" / Inconsistente         | Como deve ficar (Padrão ERP)                                              | Arquivo Alvo       |
| :---------------- | :------------------------------------------ | :------------------------------------------------------------------------ | :----------------- |
| **Clientes**      | Label "Nome Completo *"                     | Label *_"Razão Social / Nome Completo _"__                                | `CustomerForm.tsx` |
| **Clientes**      | Label "Apelido"                             | Label **"Nome Fantasia / Apelido"**                                       | `CustomerForm.tsx` |
| **Clientes**      | Label "CPF"                                 | Label **"CPF / CNPJ"** (Máscara Dinâmica)                                 | `CustomerForm.tsx` |
| **Clientes**      | Label "Telefone"                            | Label **"Telefone / WhatsApp"**                                           | `CustomerForm.tsx` |
| **Fornecedores**  | Label "Pessoa de Contato"                   | Label **"Representante Comercial"**                                       | `SupplierForm.tsx` |
| **Financeiro**    | Botão "Nova Despesa" (Ícone Plus)           | Padronizar: **"Lançar Despesa"** (Verbo Ativo)                            | `ExpensesTab.tsx`  |
| **Usuários**      | Label "Role" na Tabela                      | Label **"Perfil de Acesso"**                                              | `UserList.tsx`     |
| **Toaster**       | Cores genéricas do Radix/Shadcn             | Reforçar: **Verde (Sucesso)**, **Vermelho (Erro)**, **Amarelo (Atenção)** | `toast.tsx`        |
| **Abas (Tabs)**   | Estilo padrão (fundo cinza)                 | Estilo **"Pill" (Cápsula)** ou **"Underline"** com cor da marca           | `tabs.tsx`         |
| **Layout Global** | "Lista de Despesas" (CardTitle Customizado) | Usar Componente `<PageContainer />` ou `<SectionHeader />` para títulos   | `ExpensesTab.tsx`  |

## 2. Análise de Identidade Visual

### A. Tipografia e Feedback

- **Problema:** O feedback visual (Toasts) usa variantes padrão (`default`,
  `destructive`) que não comunicam urgência ou sucesso de forma visceral.
- **Ação:** Criar variantes semânticas explícitas no `toaster.tsx` (`success`,
  `error`, `warning`) que forcem ícones padronizados (CheckCircle,
  AlertTriangle).

### B. Navegação (Tabs)

- **Problema:** O componente `Tabs` está usando o estilo padrão do `shadcn/ui`
  (`bg-muted`), que parece "rascunho" ou wireframe.
- **Ação:** Migrar para um design `transparent` com borda inferior ativa (estilo
  Material/Professional) ou Cápsulas Claras com animação `Framer Motion`.

### C. Terminologia "De Padaria" vs "Enterprise"

- Substituir termos informais ("Gasto", "Zap", "Apelido") por termos
  corporativos ("Despesa Operacional", "WhatsApp Corporativo", "Nome Fantasia").

## 3. Conclusão e Próximos Passos

A identidade visual do sistema está fragmentada entre o "Novo Padrão"
(Vendas/Fiscal) e o "Legado" (Cadastros).

**Top 3 Ações Prioritárias:**

1. **Refatorar `CustomerForm.tsx`**: Ajustar labels para suportar PESSOA
   JURÍDICA com dignidade (Razão Social, etc).
2. **Globalizar `PageContainer` em Vendas/Despesas**: Garantir que todas as
   telas (Despesas, Usuários, Fornecedores) usem o mesmo cabeçalho de página
   (`PageContainer` já existe em `src/shared/ui/layout`).
3. **Toaster Semântico**: Garantir que erros de API não sejam apenas textos
   cinza, mas alertas visuais claros.

---

**Status da Auditoria:** ✅ CONCLUÍDA
