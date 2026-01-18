# Protocolo de Go-Live (Homologação -> Produção)

**Data de Criação:** 13/01/2026 **Responsável:** Tech Lead / DevOps
**Criticidade:** ALTA (Impacto Fiscal)

---

## 1. Visão Geral

O sistema "Adega Manager" utiliza uma arquitetura de chaveamento lógico para
alternar entre os ambientes de **Homologação** (Testes/Sandbox) e **Produção**
(Fiscal Real).

Não existe um "botão" na interface do usuário para evitar acidentes. A mudança
exige atuação em dois níveis de infraestrutura:

1. **Credenciais de API (Secrets):** Autenticação com a Nuvem Fiscal.
2. **Configuração de Loja (Database):** Flag lógica que define a URL da API.
3. **Sincronia de Ambiente:** Garantir que Dev e Prod compartilhem RPCs/Edge
   Functions.

---

## 2. Pré-Requisitos (Painel Nuvem Fiscal)

Antes de alterar qualquer coisa no sistema, garanta que a conta da **Nuvem
Fiscal** esteja pronta:

1. **Acesso:** Logue na conta de Produção da
   [Nuvem Fiscal](https://app.nuvemfiscal.com.br/).
2. **Certificado Digital (A1):** Verifique se o certificado da empresa está
   carregado e **VÁLIDO** (Status Verde).
3. **CSC (Código de Segurança do Contribuinte):** Verifique se existe um CSC de
   Produção ativo.
   - _Nota:_ O sistema não envia o CSC na requisição, mas a Nuvem Fiscal precisa
     dele internamente para assinar o XML.

---

## 3. Procedimento de Virada (Passo-a-Passo)

Realize as etapas abaixo na ordem exata.

### Fase A: Atualização de Credenciais (Supabase Secrets)

Isso garante que o `fiscal-handler` consiga se autenticar na API de Produção.

1. No painel da Nuvem Fiscal (Produção), vá em **Configurações > Credenciais de
   API**.
2. Gere ou Copie o `Client ID` e o `Client Secret`.
3. Acesse o Painel do **Supabase** do projeto.
4. Navegue até: `Project Settings` > `Edge Functions` > `Secrets`.
5. Edite (ou crie) as seguintes variáveis com os valores de Produção:

| Variável                     | Valor (Origem: Nuvem Fiscal Prod) |
| :--------------------------- | :-------------------------------- |
| `NUVEM_FISCAL_CLIENT_ID`     | `client_creds_...`                |
| `NUVEM_FISCAL_CLIENT_SECRET` | `(Token Secreto)`                 |

> ⚠️ **Atenção:** Uma vez salvos, os segredos são encriptados e não podem ser
> lidos, apenas sobrescritos.

### Fase B: Chaveamento Lógico (Banco de Dados)

Isso instrui o código a usar a URL `https://api.nuvemfiscal.com.br` (Prod) ao
invés da Sandbox.

1. No Painel do Supabase, vá em **Table Editor**.
2. Abra a tabela `store_settings`.
3. Localize a coluna `environment`.
4. Altere o valor de `'homologation'` para:

   ```text
   production
   ```
   _(Letras minúsculas)_.

5. **Salve** a alteração.

---

## 4. Validação (Checkout)

Após realizar a virada:

1. Realize uma **Venda de Teste** (ex: 1 unidade de um item barato).
2. Finalize a venda com a opção "Presencial".
3. Assim que a venda for confirmada, o sistema tentará emitir a nota.
4. Verifique o **Log de Faturamento** (`invoice_logs`) ou o painel da Nuvem
   Fiscal.
   - **Sucesso:** A nota aparecerá como `Autorizada` na Nuvem Fiscal.
   - **Falha:** Se der erro de "Credenciais Inválidas", revise a Fase A.

## 5. Rollback (Voltar para Testes)

Caso algo quebre ou seja necessário voltar para testes:

1. Volte a variable `environment` na tabela `store_settings` para
   `'homologation'`.
2. (Opcional) Restaure os Secrets de Sandbox no Supabase se precisar testar
   emissão. Apenas mudar o banco já impede envios para a URL de produção, mas
   causará erro de autenticação se os secrets forem de Prod e a URL for Sandbox.
   - _Melhor prática de Rollback:_ Reverta AMBOS (Banco e Secrets).
