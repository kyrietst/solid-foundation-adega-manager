# 06. Customer Module Architecture (CRM)

> [!NOTE]
> Este documento detalha a arquitetura do módulo de Clientes (CRM) refatorado em
> Janeiro/2026.

## 1. Visão Geral (Overview)

O módulo de clientes serve como base para o CRM e para a emissão Fiscal (NFC-e),
exigindo dados estruturados e validados.

### Principais Componentes:

- **Unified Form:** `CustomerForm.tsx` (Criação e Edição centralizadas).
- **Address Logic:** `<FiscalAddressForm />` (Validação fiscal, IBGE).
- **Hooks:** `use-crm.ts` (Lógica de negócios e Data Fetching).

---

## 2. Estrutura de Dados (`CustomerProfile`)

O Frontend utiliza uma interface TypeScript estrita (`CustomerProfile`) que
reflete as colunas do banco, mas com tipagem enriquecida para Enums e JSON.

### Endereço Fiscal (`FiscalAddress`)

O campo `address` no banco é `jsonb`, mas no código segue estritamente a
interface `FiscalAddress`:

```typescript
export interface FiscalAddress {
  cep: string; // 8 dígitos (sem traço no DB/API)
  logradouro: string;
  numero: string; // Obrigatório (NFe)
  complemento: string;
  bairro: string;
  codigo_municipio: string; // IBGE (Crucial para ISS/ICMS)
  nome_municipio: string;
  uf: string; // 2 chars (EX: SP)
  pais: string; // 'Brasil'
  codigo_pais: string; // '1058'
}
```

> [!IMPORTANT]
> O `codigo_municipio` deve ser o código IBGE de 7 dígitos. Sem isso, a emissão
> fiscal REJEITA a nota se for identificada.

---

## 3. Unified Form Architecture (`CustomerForm.tsx`)

Abandonamos a abordagem de múltiplos formulários (`NewCustomerForm`,
`EditCustomerForm`) em favor de um **Componente Único e Inteligente**.

### Recursos:

1. **Dual Mode:** Aceita `customerId?` (prop opcional).
   - Se presente: Busca dados (`useCustomer`), popula form e atualiza
     (`UPDATE`).
   - Se ausente: Inicia limpo e cria novo (`INSERT`).
2. **Sanitização de Payload:**
   - Converte `""` (string vazia) para `null` em campos opcionais (`birthday`,
     `email`, `phone`).
   - Previne erros do PostgreSQL (`invalid input syntax for type date`).
3. **Cálculo de Completude:**
   - Exibe barra de progresso em tempo real baseada no preenchimento de campos
     estratégicos (Tags, Permissões, Endereço).

---

## 4. Address Lookup Strategy (`address-lookup.ts`)

Para garantir UX fluida e Dados Fiscais, utilizamos uma estratégia de
**Redundância Invertida**:

1. **Prioridade 1: ViaCEP** (`fetchViaCEP`)
   - **Motivo:** Mais estável, sem bloqueio de CORS em produção, garante retorno
     do IBGE.
2. **Fallback: BrasilAPI** (`fetchBrasilAPI`)
   - **Motivo:** Rica em dados (coordenadas), mas instável devido a Rate Limit e
     CORS.

O hook captura erros silenciosamente e tenta o próximo provider, garantindo que
o usuário quase sempre tenha o endereço preenchido automaticamente.

---

## 5. CRM Hooks (`use-crm.ts`)

Centralizamos todas as operações de banco neste arquivo para manter a regra
**"Zero Supabase in Components"**.

- **`useUpsertCustomer`:** Mutation inteligente que invalida caches
  (`'customers'`, `'reports'`) após sucesso.
- **`useCustomer`:** Fetch de dados single-entity com tipagem segura
  (`as unknown as CustomerProfile`).
- **`useCustomers`:** Listagem com suporte a busca (`ilike`) e paginação.

> [!TIP]
> O `staleTime` está configurado para 5 minutos para performance, mas
> `useUpsertCustomer` força a atualização imediata.
