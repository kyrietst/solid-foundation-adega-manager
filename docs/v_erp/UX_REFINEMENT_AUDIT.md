# Relatório de Refinamento UX

## 1. Fricção de Cadastro (Inputs)

Análise focada em reduzir barreiras para usuários migrando do "caderninho".

| Formulário       | Campo                 | Status Atual          | Sugestão                     | Motivo                                                                                                                           |
| :--------------- | :-------------------- | :-------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Novo Cliente** | `contact_permission`  | Obrigatório (True)    | **Opcional** ou Default True | Obrigar o caixa a marcar "Aceito termos LGPD" ao cadastrar um amigo/vizinho gera fricção desnecessária e pausa o fluxo de venda. |
| **Novo Cliente** | `address`             | Visível               | **Ocultar (Collapse)**       | O "caderninho" raramente tem endereço. Só exibir se for entrega. Deixar minimizado por padrão.                                   |
| **Novo Produto** | `ncm`, `cest`, `cfop` | Card Dedicado Visível | **Mover para "Avançado"**    | O usuário pequeno não sabe o que é NCM. Esses campos assustam. Esconder em um Accordion "Dados Fiscais (Opcional)".              |
| **Novo Produto** | `packaging_type`      | Select (Fardo)        | **Manter**                   | Venda de fardo é crítica para adegas (fluxo atual de toggle está bom).                                                           |
| **Fornecedor**   | `payment_methods`     | Obrigatório           | **Opcional**                 | Muitas vezes o pequeno comerciante paga "como dá" ou no dinheiro. Não travar se não souber a política formal.                    |
| **Despesa**      | `description`         | Obrigatório           | **Manter**                   | Essencial para identificar o gasto depois.                                                                                       |

## 2. Overengineering Identificado

Funcionalidades que adicionam complexidade cognitiva ou técnica sem valor
imediato para o perfil "Caderninho".

- [ ] **Automação N8N (`N8NPlaceholder.tsx`)**:
  - **Descrição:** Placeholder para integração com N8N.
  - **Ação:** **REMOVER**. O usuário inicial não vai configurar webhooks
    complexos agora. Limpar código morto.
- [ ] **Customer Profile Completeness (`CustomerForm.tsx`)**:
  - **Descrição:** Barra de progresso "gamificada" e algoritmo de pesos para
    completude do perfil.
  - **Ação:** **SIMPLIFICAR**. Remover o cálculo visual de pesos. Manter apenas
    aviso sutil se faltar dados críticos (Ex: "Sem telefone"). A barra colorida
    e porcentagem distraem.
- [ ] **Customer Insights & Timeline (`CustomerInsightsTab.tsx`,
      `CustomerTimeline.tsx`)**:
  - **Descrição:** Abas complexas de analíticos preditivos e timeline de
    eventos.
  - **Ação:** **OCULTAR**. Mover para uma aba "Analíticos" única ou esconder na
    versão "Starter". O foco deve ser "Quem é" e "O que comprou".
- [ ] **Data Quality Alerts (`DataQualityDashboard.tsx`)**:
  - **Descrição:** Dashboard para monitorar qualidade de dados.
  - **Ação:** **REMOVER/OCULTAR**. O usuário não quer gerenciar a qualidade dos
    dados, ele quer vender. Isso é ferramenta de Admin de TI.

## 3. Centralização de Marketing

Reorganização para limpar a Sidebar e agrupar funcionalidades de crescimento.

- **Criar módulo/rota `/marketing` (se não houver)**
- **Componentes a Mover/Refatorar:**
  - `src/features/customers/components/AutomationCenter.tsx` -> **Mover para
    Pricing/Marketing** ou Remover se for "fake".
  - `src/features/customers/components/CustomerCommunicationTab.tsx` -> **Mover
    para Marketing > Campanhas**. Isolar a comunicação em massa da ficha
    individual do cliente.
  - (Sugestão) Criar **"Lista de Transmissão"** simples em Marketing em vez de
    automação complexa.

---

**Status:** Auditado em 04/01/2026. **Próximo Passo:** Aprovar ações de limpeza
e iniciar Fase 4.1 (Clean-up).
