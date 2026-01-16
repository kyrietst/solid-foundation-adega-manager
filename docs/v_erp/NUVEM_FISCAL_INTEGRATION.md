# Integração Nuvem Fiscal & SEFAZ-SP (Guia de Sobrevivência)

> [!WARNING]
> **LEIA ANTES DE CODAR:** Esta integração lida com documentos fiscais reais.
> Erros aqui podem gerar multas, travamento de CNPJ e prejuízo financeiro.
> **ZERO TRUST:** Nunca confie que "vai funcionar". Trate cada requisição como
> uma transação financeira crítica.

---

## 1. Arquitetura de Ambientes

O sistema opera em dois modos distintos, definidos pela tabela `store_settings`
no banco de dados.

### A. Tabela `store_settings` (Source of Truth)

| Coluna        | Tipo     | Descrição                                                 |
| :------------ | :------- | :-------------------------------------------------------- |
| `environment` | `string` | `'production'` ou `'development'` (Homologação).          |
| `csc_id`      | `string` | ID do CSC na SEFAZ (Ex: `1` para Prod, `2` para Homolog). |
| `csc_token`   | `string` | Token alfanumérico do CSC.                                |
| `cnpj`, `ie`  | `string` | Dados fiscais da empresa emissora.                        |

> [!IMPORTANT]
> A Edge Function `fiscal-handler` lê essa tabela dinamicamente.
>
> - Se `environment = 'production'`, ela aponta para `api.nuvemfiscal.com.br` e
>   usa `tpAmb=1`.
> - Se `environment = 'development'`, ela aponta para
>   `api.sandbox.nuvemfiscal.com.br` e usa `tpAmb=2`.

### B. Credenciais (Edge Function Secrets)

As chaves de API **NÃO** ficam no banco. Elas vivem nas variáveis de ambiente da
Edge Function:

- `NUVEM_FISCAL_CLIENT_ID`
- `NUVEM_FISCAL_CLIENT_SECRET`

---

## 2. API `fiscal-handler` (RPC Gateway)

Todas as operações fiscais devem passar por esta função. Nunca chame a API da
Nuvem Fiscal diretamente do frontend.

**Endpoint:** `/functions/v1/fiscal-handler`

### Payload de Emissão (`action: 'emit'`)

Envie para gerar uma NFC-e. A função busca os dados da venda no banco
automaticamente.

```json
{
  "sale_id": "uuid-da-venda",
  "action": "emit", // Opcional (default)
  "cpfNaNota": "000.000.000-00" // Opcional
}
```

### Payload de Cancelamento (`action: 'cancel'`)

**NOVO (Hybrid Flow):** Cancela uma nota autorizada.

```json
{
  "sale_id": "uuid-da-venda",
  "action": "cancel",
  "reason": "Cliente desistiu da compra... (Min 15 chars)" // OBRIGATÓRIO
}
```

---

## 3. Fluxo Híbrido de Cancelamento (Hybrid Cancellation)

A exclusão de vendas segue um protocolo estrito para evitar inconsistência
fiscal vs. estoque.

### Regra de Ouro

> [!CAUTION]
> **Se existe Nota Fiscal Autorizada, o cancelamento FISCAL deve ocorrer ANTES
> do estorno de estoque/financeiro. Se a API fiscal falhar, o processo deve ser
> ABORTADO.**

### O Fluxo (Implementado em `useSalesMutations.ts`)

1. **Verificação:** O sistema consulta `invoice_logs` para saber se a venda tem
   NF autorizada.
2. **Bifurcação:**
   - **SEM NOTA:** UI chama direto `rpc/cancel_sale`. Estoque é estornado. Fim.
   - **COM NOTA:**
     1. UI exige justificativa (>15 chars).
     2. UI chama `fiscal-handler` (`action: 'cancel'`).
     3. Edge Function autentica na Nuvem Fiscal e envia cancelamento para SEFAZ.
     4. **Sucesso:** Edge Function retorna 200. UI prossegue para
        `rpc/cancel_sale`.
     5. **Erro:** Edge Function retorna 400/500. UI exibe erro e **NÃO** estorna
        estoque.

---

## 4. Troubleshooting Comum

### Erro 539: Duplicidade de Chave

**Causa:** Tentar emitir uma nota para uma venda que já foi enviada, mas o
retorno se perdeu (timeout). **Solução Automática:** A `fiscal-handler` possui
**Auto-Recovery**. Ela detecta o erro 539, extrai a chave de acesso da mensagem
de erro, consulta a API da Nuvem Fiscal pela nota existente e atualiza o
`invoice_logs` com o XML/PDF recuperado.

### Rejeição: Justificativa Inválida

**Causa:** Tentar cancelar com texto curto (ex: "teste"). **Solução:** A SEFAZ
exige mínimo de 15 caracteres. O frontend já valida isso, mas a API também
bloqueia.

### Erro de Autenticação (401)

**Causa:** `NUVEM_FISCAL_CLIENT_ID` inválido ou expirado, ou horário do servidor
desincronizado. **Verificação:** Cheque os Secrets da Edge Function no Dashboard
Supabase.

---

## 5. Comandos Úteis

**Deploy da Função (Produção):**

```bash
npx supabase functions deploy fiscal-handler --project-ref uujkzvbgnfzuzlztrzln --no-verify-jwt
```

**Nota:** `--no-verify-jwt` é usado porque fazemos a validação de
`Authorization` manualmente dentro do código para suportar chamadas via RPC/Cron
se necessário.

**Verificar Logs:** Acesse o Dashboard Supabase > Edge Functions >
fiscal-handler > Logs.
