# 🧪 Protocolo de Homologação Visual (Smoke Test)

**Versão:** 2.0 (Interface Enterprise) | **Status:** 🟡 Pendente Validação

## 🏪 Grupo 1: Frente de Loja

### 1.1 Vendas (PDV)

- [ok] **Carrinho:** Adicionar produto via Código de Barras e Pesquisa Manual.
- [ok] **Tabela:** Verificar se headers são "Vlr. Unit." e "Vlr. Total".
- [ok] **Finalização:** Emitir venda e verificar se o PDF abre (Nuvem Fiscal).

### 1.2 Clientes (CRM)

- [ok] **Novo Cliente:** Clicar em "Novo Cliente". **Deve abrir Side Sheet
  (Direita)**.
- [ok] **Formulário:** Testar máscara de CPF/CNPJ e Telefone.
- [ok] **Perfil:** Abrir um cliente existente. Verificar se as abas são apenas
  "Visão Geral" e "Histórico".

## 📦 Grupo 2: Estoque & Compras

### 2.1 Produtos

- [ok] **Novo Produto:** Clicar "Novo Produto". **Deve abrir Side Sheet
  (Direita)**.
- [ok] **Scroll:** Preencher dados e rolar até o fim (Fiscal) sem travar.
- [ok] **Edição:** Editar um produto existente. O modal abre corretamente?

### 2.2 Movimentações

- [] **Entrada:** Lançar entrada de estoque. Verificar termo "Natureza da
  Operação".

## 💰 Grupo 3: Gestão

### 3.1 Despesas

- [ok] **Nova Despesa:** Lançar despesa. Verificar se o botão diz "Lançar
  Despesa".
- [ok] **Tabela:** Verificar alinhamento das colunas (Correção TS aplicada).

## ⚙️ Grupo 4: Sistema

### 4.1 Navegação

- [ok] **Sidebar:** Testar clique em todos os 4 grupos. O menu expande/colapsa
  suavemente?
- [ ] **Mobile:** (Se possível) Abrir em tela pequena e testar o menu
      hambúrguer.

---

**Instruções:** Se encontrar erro visual, tire print. Se for erro de travamento,
copie o log do Console (F12).
