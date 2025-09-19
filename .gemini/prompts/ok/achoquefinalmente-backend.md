
---

###  Tarefa 1: O Cérebro da Operação (Back-end)

**Agente a ser utilizado:** `supabase-database-architect`

**Prompt:**
**Assunto: Missão Crítica - Criar a Procedure `set_product_stock_absolute` e Eliminar a Complexidade**

**Diretriz Principal: Simplicidade da 5ª Série.**

**Contexto:**
Estamos abandonando a arquitetura de "cálculo de deltas" que causou bugs de corrupção de dados. A nova arquitetura é baseada em **Estado Absoluto**: o usuário informa o estoque final, e o banco de dados faz o resto.

**Sua Missão:**
1.  **Crie uma nova stored procedure** chamada `set_product_stock_absolute`.
2.  **Parâmetros de Entrada:** Ela deve aceitar os seguintes valores:
    * `p_product_id` (UUID)
    * `p_new_packages` (INTEGER) -> O número total e final de pacotes.
    * `p_new_units_loose` (INTEGER) -> O número total e final de unidades soltas.
    * `p_reason` (TEXT) -> O motivo do ajuste.
    * `p_user_id` (UUID)

3.  **Lógica Interna (Simples como Subtração):**
    * **Passo 1:** Descubra o estoque antigo do produto (`old_packages`, `old_units_loose`).
    * **Passo 2:** Calcule a diferença: `package_change = p_new_packages - old_packages` e `units_change = p_new_units_loose - old_units_loose`.
    * **Passo 3:** Se houver mudança, registre **apenas a diferença** na tabela de auditoria `inventory_movements`.
    * **Passo 4:** Atualize a tabela `products` com os **valores absolutos** recebidos: `stock_packages = p_new_packages` e `stock_units_loose = p_new_units_loose`.

4.  **Forneça o código SQL completo** da nova procedure. Ela deve ser a única fonte de verdade e lógica para o ajuste de estoque.

---

