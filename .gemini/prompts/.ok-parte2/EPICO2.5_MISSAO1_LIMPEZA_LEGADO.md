

---

### Prompt Detalhado para a Missão de Limpeza

(Salve este conteúdo em um arquivo, por exemplo, `EPICO2.5_MISSAO1_LIMPEZA_LEGADO.md`)

**Agente a ser utilizado:** `supabase-database-architect`

**Assunto: Missão de Limpeza Prioritária - Remover Funções Legadas do Banco de Dados**

**Contexto:**
A auditoria de segurança (`RBAC_RLS_AUDIT_REPORT.md`) identificou uma **descoberta crítica**: a existência de funções legadas em nosso banco de dados (`has_role()`, `set_default_permissions()`) que fazem referência a tabelas que não existem mais. Conforme a recomendação da auditoria e a decisão da arquitetura, estas funções devem ser removidas antes de prosseguirmos com a implementação das *feature flags*.

**Sua Missão:**
Sua tarefa é executar uma remoção segura e definitiva destas funções legadas para eliminar débitos técnicos e prevenir futuros bugs.

1.  **Análise de Impacto (Passo de Segurança Mandatório):**
    * Antes de executar qualquer comando `DROP`, você deve realizar uma análise de impacto. Verifique em todo o esquema do banco de dados (outras funções, triggers, políticas RLS) se alguma dessas funções legadas (`has_role()`, `set_default_permissions()`) ainda está sendo referenciada ou chamada por qualquer outro objeto do banco.
    * Se alguma dependência for encontrada, você deve reportá-la imediatamente e aguardar a decisão. **Não prossiga com a exclusão se houver dependências ativas.**

2.  **Execução da Limpeza:**
    * Após confirmar que não há dependências ativas, execute os comandos `DROP FUNCTION` para cada uma das funções legadas identificadas no `RBAC_RLS_AUDIT_REPORT.md`.

3.  **Validação:**
    * Após a exclusão, execute uma verificação para confirmar que as funções não existem mais no banco de dados.

**Formato da Entrega:**
Produza um relatório de conclusão em `docs/diagnostics/LEGACY_FUNCTIONS_CLEANUP_REPORT.md`. O relatório deve conter:
* O resultado da sua análise de impacto (confirmando que não havia dependências).
* Os comandos `DROP FUNCTION` que foram executados.
* A confirmação final de que as funções foram removidas com sucesso.

**Critério de Aceitação:**
- As funções legadas `has_role()` e `set_default_permissions()` devem ser completamente removidas do nosso banco de dados Supabase.
- A aplicação deve permanecer 100% funcional após a remoção.

---
