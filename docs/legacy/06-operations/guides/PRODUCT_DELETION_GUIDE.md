# 🗑️ Guia de Exclusão de Produtos

> **Versão**: 3.3.4
> **Público**: Usuários operacionais e administradores
> **Última Atualização**: 25 de outubro de 2025

---

## 📋 Visão Geral

Este guia explica como excluir e restaurar produtos no sistema Adega Manager. O sistema utiliza **exclusão segura** (soft delete), que preserva o histórico de vendas e permite recuperação de produtos deletados acidentalmente.

### 🎯 Conceitos Importantes

**Soft Delete (Exclusão Segura)**
- Produtos deletados **não são removidos permanentemente** do banco de dados
- O histórico de vendas e movimentações é **preservado**
- Apenas **administradores** podem visualizar e restaurar produtos deletados
- Produtos deletados **não aparecem** no ponto de venda nem nos relatórios

---

## 🔒 Permissões

| Ação | Usuário | Employee | Admin |
|------|---------|----------|-------|
| **Ver produtos ativos** | ✅ | ✅ | ✅ |
| **Deletar produto** | ❌ | ✅ | ✅ |
| **Ver produtos deletados** | ❌ | ❌ | ✅ |
| **Restaurar produto** | ❌ | ❌ | ✅ |

---

## 📖 Como Deletar um Produto

### Passo 1: Acesse a Gestão de Estoque

1. No menu lateral, clique em **"Gestão de Estoque"**
2. Localize o produto que deseja deletar
3. Clique no produto para abrir os detalhes

### Passo 2: Inicie a Exclusão

1. No modal de detalhes do produto, clique no botão **"Excluir Produto"** (vermelho, ícone de lixeira)
2. Um modal de confirmação será exibido

### Passo 3: Confirme a Exclusão

O modal de confirmação mostra:

```
🗑️ Excluir Produto

⚠️ ATENÇÃO: Esta ação não pode ser desfeita por usuários comuns.
Apenas administradores podem restaurar produtos deletados.

📦 Informações do Produto:
Nome: Vinho Tinto Reserva 2020
Categoria: Vinhos Tintos
Código de Barras: 7891234567890
Estoque: 5 pacotes (120 unidades)

⚠️ Este produto tem 15 vendas registradas
⚠️ Este produto tem 8 movimentações de estoque

Para confirmar, digite o nome exato do produto:
[___________________________]

Digite "Vinho Tinto Reserva 2020"
```

**Importante:**
- ⚠️ O nome deve ser digitado **exatamente** como aparece (maiúsculas/minúsculas)
- ⚠️ Se o produto tem vendas ou movimentações, elas serão preservadas
- ⚠️ O produto desaparecerá do POS e dos relatórios imediatamente

### Passo 4: Digite o Nome e Confirme

1. Digite o nome **exato** do produto (case-sensitive)
2. O botão **"Confirmar Exclusão"** ficará habilitado
3. Clique em **"Confirmar Exclusão"**
4. Aguarde a mensagem de sucesso

**Resultado:**
- ✅ Produto removido da lista ativa
- ✅ Não aparece mais no POS
- ✅ Histórico preservado
- ✅ Auditoria registrada (quem deletou + quando)

---

## 👁️ Como Visualizar Produtos Deletados (Admin Only)

### Passo 1: Acesse a Aba de Deletados

1. Vá para **"Gestão de Estoque"**
2. No topo da página, você verá dois botões:
   - **"Produtos Ativos"** com badge verde (ex: 527)
   - **"Produtos Deletados"** com badge vermelho (ex: 3)
3. Clique em **"Produtos Deletados"**

### Passo 2: Visualize a Lista

A lista mostra cards vermelhos com:

```
┌─────────────────────────────────────────┐
│ 🍷 Vinho Tinto Reserva 2020             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│ 📛 DELETADO                             │
│                                         │
│ Categoria: Vinhos Tintos                │
│ Código: 7891234567890                   │
│ Estoque: 5 pacotes (120 unidades)      │
│                                         │
│ 📅 Deletado em: 25/10/2025 às 14:30   │
│ 👤 Por: João Silva (Admin)             │
│                                         │
│         [🔄 Restaurar Produto]          │
└─────────────────────────────────────────┘
```

---

## 🔄 Como Restaurar um Produto (Admin Only)

### Método 1: Restauração Simples

1. Na aba **"Produtos Deletados"**, localize o produto
2. Clique no botão **"🔄 Restaurar Produto"**
3. Confirme a ação
4. Aguarde a mensagem de sucesso

**Resultado:**
- ✅ Produto volta para a lista ativa
- ✅ Aparece novamente no POS
- ✅ Estoque e dados preservados
- ✅ Histórico de vendas intacto

### Método 2: Restauração com Ajustes (Futuro)

*Em desenvolvimento: possibilidade de ajustar dados antes de restaurar*

---

## ⚠️ Casos de Uso e Boas Práticas

### ✅ Quando Deletar

**Situações apropriadas:**
- Produto **descontinuado** pela vinícola
- **Erro de cadastro** (duplicata)
- Produto **nunca vendido** e fora de linha
- Mudança de fornecedor (criar novo cadastro)

**Exemplo:**
```
Situação: Vinícola descontinuou "Merlot 2018"
Ação: Deletar o produto
Motivo: Não será mais vendido, mas histórico deve ser preservado
```

### ❌ Quando NÃO Deletar

**Situações inadequadas:**
- Produto **temporariamente fora de estoque** → Use estoque zero
- Produto em **promoção pausada** → Mantenha ativo, apenas não promova
- **Ajuste de preço necessário** → Use funcionalidade de edição
- **Teste de sistema** → Use ambiente de desenvolvimento

**Exemplo:**
```
❌ ERRADO: Deletar produto porque acabou o estoque
✅ CORRETO: Ajustar estoque para zero e aguardar reposição
```

---

## 🚨 Cenários Comuns e Soluções

### Cenário 1: Deletei por Engano
**Problema**: Deletei produto ativo por erro
**Solução**:
1. Solicite a um **administrador** a restauração
2. Admin vai em "Produtos Deletados" e clica "Restaurar"
3. Produto volta ao normal imediatamente

### Cenário 2: Produto Não Aparece no POS
**Problema**: Produto sumiu do ponto de venda após commit
**Causa Possível**: Migração de banco não aplicada em produção
**Solução**:
1. Verifique se colunas `deleted_at` e `deleted_by` existem
2. Administrador deve aplicar migração SQL
3. **Ver**: [Troubleshooting - Production Database Fix](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md#problema-produtos-não-aparecem-na-lista)

### Cenário 3: Quero Deletar Permanentemente
**Problema**: Preciso remover produto completamente do banco
**Resposta**:
- ⚠️ **NÃO é possível** por usuários finais
- ⚠️ Requer acesso direto ao banco de dados
- ⚠️ Pode quebrar relatórios e histórico
- ✅ **Alternativa**: Manter deletado permanentemente (invisível para todos exceto admins)

### Cenário 4: Produto com Muitas Vendas
**Problema**: Produto tem 500+ vendas, posso deletar?
**Resposta**:
- ✅ **SIM**, pode deletar com segurança
- ✅ Todas as vendas serão **preservadas**
- ✅ Relatórios históricos continuam funcionando
- ✅ Apenas não aparecerá em novas vendas

---

## 📊 Auditoria e Rastreamento

### Informações Registradas

Toda exclusão registra:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **deleted_at** | Data e hora da exclusão | 2025-10-25 14:30:15-03 |
| **deleted_by** | UUID do usuário que deletou | 7b0c690f-c462-47a1... |
| **Nome do usuário** | Exibido na interface | "João Silva" |
| **Role** | Papel do usuário | "admin" ou "employee" |

### Consulta de Auditoria (Admin)

**Via Interface:**
1. Acesse "Produtos Deletados"
2. Cada card mostra quem deletou e quando

**Via Banco de Dados (Dev/DBA):**
```sql
-- Ver produtos deletados com detalhes
SELECT
  p.name,
  p.deleted_at,
  u.email as deleted_by_email,
  pr.role as deleted_by_role
FROM products p
LEFT JOIN auth.users u ON p.deleted_by = u.id
LEFT JOIN profiles pr ON p.deleted_by = pr.id
WHERE p.deleted_at IS NOT NULL
ORDER BY p.deleted_at DESC;
```

---

## 🔧 Solução de Problemas

### Problema: Botão "Excluir" Não Aparece
**Causa**: Usuário não tem permissão
**Solução**: Verifique se seu role é `employee` ou `admin`

### Problema: Nome Digitado Não Funciona
**Causa**: Nome case-sensitive ou com espaços extras
**Solução**:
- Copie e cole o nome exatamente como aparece
- Verifique espaços no início/fim
- Verifique maiúsculas/minúsculas

### Problema: Erro 400 ao Carregar Produtos
**Causa**: Migração SQL não aplicada
**Solução**: Ver [Troubleshooting Técnico](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md#problema-erro-400-ao-buscar-produtos)

### Problema: Aba "Deletados" Não Aparece
**Causa 1**: Não é administrador
**Causa 2**: Bug no AuthContext (corrigido em v3.3.4)
**Solução**: Atualizar para v3.3.4+

---

## 📚 Documentação Adicional

### Para Usuários Operacionais
- Este guia (você está aqui)
- [Manual do Usuário - Gestão de Estoque](../user-manual/inventory-management.md)

### Para Administradores
- [Sistema de Soft Delete - Documentação Técnica](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md)
- [Troubleshooting Avançado](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md#troubleshooting)

### Para Desenvolvedores
- [Changelog v3.3.4](../../07-changelog/PRODUCT_DELETE_MODAL_FIXES_v3.3.4.md)
- [Arquitetura do Sistema](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md#arquitetura)
- [API e RLS Policies](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md#políticas-rls-row-level-security)

---

## ❓ Perguntas Frequentes

### P: Se eu deletar um produto, as vendas antigas vão sumir dos relatórios?
**R**: Não! Todas as vendas são **preservadas**. Apenas o produto não aparecerá em **novas** vendas.

### P: Posso deletar um produto que tem estoque?
**R**: Sim. O estoque é preservado e será restaurado se o produto for recuperado.

### P: Quanto tempo um produto deletado fica armazenado?
**R**: Permanentemente. Não há exclusão automática. Apenas admins podem gerenciar.

### P: Posso ver quem deletou um produto?
**R**: Sim, se você for **administrador**. A informação aparece no card do produto deletado.

### P: O que acontece se eu restaurar um produto com código de barras duplicado?
**R**: O sistema permite, mas você deve ter cuidado. Verifique se não há outro produto ativo com o mesmo código antes de restaurar.

### P: Funcionários podem restaurar produtos?
**R**: Não. Apenas **administradores** podem visualizar e restaurar produtos deletados.

---

## 📞 Suporte

**Problemas operacionais**: Consulte este guia ou contate o administrador do sistema
**Problemas técnicos**: Ver [Troubleshooting Técnico](../../03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md)
**Bugs**: Reportar via sistema de issues do projeto

---

**Versão do Guia**: 3.3.4
**Última Atualização**: 25 de outubro de 2025
**Autor**: Equipe Adega Manager
