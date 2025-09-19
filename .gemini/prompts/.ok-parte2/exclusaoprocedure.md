Exato. O próximo e último passo para encerrar este épico com chave de ouro é a limpeza.

Com a nova procedure `set_product_stock_absolute` em pleno funcionamento e sendo utilizada pelo frontend, a antiga `adjust_stock_explicit` tornou-se um "legado" desnecessário e potencialmente arriscado no nosso banco de dados.

Vamos eliminá-la para garantir que não seja usada acidentalmente no futuro e para manter nosso código limpo.

Aqui está o prompt para a missão de limpeza final.

---

### Prompt para Limpeza Final

**Agente a ser utilizado:** `supabase-database-architect`

**Assunto:** **Limpeza Final do Épico 1: Excluir a Procedure `adjust_stock_explicit` Depreciada**

**Contexto:**
Concluímos com sucesso a migração para a arquitetura de **Estado Absoluto**. A nova procedure `set_product_stock_absolute` está funcionando perfeitamente e o frontend já foi atualizado para utilizá-la. A procedure antiga, `adjust_stock_explicit`, agora está obsoleta.

**Sua Missão:**
1.  **Confirmação de Segurança:** Antes de excluir, realize uma verificação final para garantir que nenhuma parte do sistema ainda faz referência ou chama a procedure `adjust_stock_explicit`.
2.  **Executar a Exclusão:** Após a confirmação, execute o comando `DROP FUNCTION` para remover permanentemente a procedure `adjust_stock_explicit` do nosso banco de dados.
3.  **Confirmar a Conclusão:** Reporte a conclusão bem-sucedida da exclusão.

**Critério de Aceitação:**
- A procedure `adjust_stock_explicit` não deve mais existir no nosso esquema do Supabase.
- A aplicação deve continuar 100% funcional, utilizando apenas a nova procedure.