# 🛒 Sales (POS) - Sistema de Vendas

> Módulo de ponto de venda completo com carrinho inteligente e multi-pagamento

## 📋 Visão Geral

O módulo **Sales** é o coração operacional do Adega Manager, responsável por todas as vendas presenciais através de um sistema POS (Point of Sale) completo e moderno.

### 🎯 Funcionalidades Principais
- **POS Completo** - Interface otimizada para vendas rápidas
- **Scanner de Código de Barras** - Integração com hardware de scanner
- **Carrinho Inteligente** - Suporte a variantes (unidade/pacote)
- **Sistema de Desconto** - Descontos flexíveis por item ou total
- **Multi-Pagamento** - Suporte a diversos métodos de pagamento
- **Cálculo de Troco** - Automático para pagamentos em dinheiro
- **Sistema de Delivery** - Gestão completa de entregas com endereço, taxa e entregador
- **Carrinho Responsivo** - Interface adaptável para diferentes tamanhos de monitor

### 📊 Status Atual
- **Status**: ✅ **100% Funcional em Produção**
- **Vendas Processadas**: 52+ vendas reais
- **Uptime**: 99.9%
- **Performance**: <2s por venda
- **Última Atualização**: v2.0 Ultra-Simplificação

## 🏗️ Arquitetura do Módulo

### Estrutura de Pastas
```
features/sales/
├── components/           # Componentes de vendas
│   ├── SalesPage.tsx    # Página principal do POS
│   ├── FullCart.tsx     # Carrinho completo
│   ├── ProductsGrid.tsx # Grid de produtos
│   ├── ProductSelectionModal.tsx # Modal de seleção
│   └── CustomerSearch.tsx # Busca de clientes
├── hooks/               # Hooks específicos
│   ├── use-cart.ts      # Gestão do carrinho
│   ├── use-sales.ts     # Operações de venda
│   └── use-barcode.ts   # Scanner de código
├── types/               # Tipos TypeScript
└── __tests__/           # Testes do módulo
```

### Fluxo Principal
```
Produto Selecionado → Carrinho → Cliente → Pagamento → Finalização
        ↓                ↓         ↓         ↓           ↓
   Verificação      Cálculo    Busca/     Multi-    Atualização
   Estoque          Preços     Cadastro   Métodos    Estoque
```

## 🧩 [Componentes Principais](./components.md)

### Interface Principal
- **`SalesPage.tsx`** - Layout principal do POS com suporte a delivery/presencial
- **`FullCart.tsx`** - Carrinho responsivo com seções colapsáveis e altura dinâmica
- **`ProductsGrid.tsx`** - Grid de produtos com search/filtros

### Modais e Diálogos
- **`ProductSelectionModal.tsx`** - Escolha unidade/pacote
- **`CustomerSearch.tsx`** - Busca e seleção de clientes
- **`PaymentModal.tsx`** - Finalização de pagamento

### Componentes de Apoio
- **`BarcodeScanner.tsx`** - Interface do scanner
- **`PriceCalculator.tsx`** - Cálculos de preço/desconto
- **`PaymentMethods.tsx`** - Seleção de métodos

## 🔧 [Lógica de Negócio](./business-logic.md)

### Regras de Estoque (Ultra-Simplificação v2.0)
```typescript
// ✅ Lógica Ultra-Simples
if (stockUnitsLoose > 0 && stockPackages > 0) {
  // TEM AMBOS: Modal para escolher
} else if (stockUnitsLoose > 0) {
  // SÓ UNIDADES: Adicionar automaticamente
} else if (stockPackages > 0) {
  // SÓ PACOTES: Adicionar automaticamente
}
```

### Sistema de Desconto
- **Desconto por Item** - Aplicado individualmente
- **Desconto Total** - Aplicado ao final da venda
- **Validação de Permissões** - Controle por role
- **Persistência Correta** - Salvo no banco de dados

### Cálculo de Preços
- **Preços Dinâmicos** - Busca em tempo real do banco
- **Variantes** - Preços diferentes para unidade/pacote
- **Margem de Segurança** - Validação de estoque

## 🔌 [API e Hooks](./api.md)

### Hooks Principais
- **`useCart()`** - Gestão completa do carrinho
- **`useUpsertSale()`** - Criação/atualização de vendas
- **`usePaymentMethods()`** - Métodos de pagamento
- **`useBarcode()`** - Scanner de código de barras

### Endpoints Utilizados
- **`/sales`** - CRUD de vendas
- **`/sale_items`** - Itens de venda
- **`/products`** - Busca de produtos
- **`/customers`** - Busca de clientes

### Stored Procedures
- **`process_sale()`** - Processamento completo da venda
- **`delete_sale_with_items()`** - Exclusão segura
- **`adjust_product_stock()`** - Ajustes de estoque

## 📱 Interface do Usuário

### Layout Principal
- **Grid de Produtos** (esquerda) - Busca e seleção com tipos de venda (presencial/delivery)
- **Carrinho Responsivo** (direita) - Interface adaptável com seções colapsáveis
- **Header** - Navegação e usuário
- **Footer** - Status e informações

### Design Responsivo do Carrinho
- **Altura Dinâmica**: `h-[calc(100vh-120px)]` com limites min/max
- **Seções Colapsáveis**: Cliente, Pagamento e Entrega podem ser recolhidas
- **Lista de Produtos Garantida**: Altura mínima de 200px sempre visível
- **Scroll Independente**: Produtos acessíveis mesmo com formulários preenchidos
- **Adaptação Automática**: Interface se ajusta a diferentes tamanhos de monitor

### Interações Principais
1. **Seleção de Tipo** - Presencial ou Delivery no início da venda
2. **Busca de Produto** - Por nome, categoria ou código
3. **Adição ao Carrinho** - Click direto ou modal com variantes
4. **Scanner** - Leitura de código de barras
5. **Gestão de Seções** - Expandir/recolher Cliente, Pagamento, Entrega
6. **Finalização** - Pagamento com validações específicas por tipo

### Estados da Interface
- **Loading** - Durante operações
- **Empty** - Carrinho vazio
- **Error** - Tratamento de erros
- **Success** - Venda finalizada

## 🔒 Segurança e Permissões

### Controle de Acesso
- **Admin** - Acesso total, incluindo descontos
- **Employee** - Vendas sem visualizar custos
- **Delivery** - Sem acesso ao módulo

### Validações
- **Estoque** - Verificação em tempo real
- **Preços** - Validação de integridade
- **Descontos** - Limite por role
- **Pagamentos** - Validação de valores

## 📊 Métricas e KPIs

### Performance Operacional
- **Tempo Médio de Venda** - ~1-2 minutos
- **Taxa de Erro** - <1%
- **Uptime** - 99.9%
- **Satisfação** - Alta (feedback informal)

### Métricas de Negócio
- **Vendas por Dia** - Variável
- **Ticket Médio** - Calculado automaticamente
- **Produtos Mais Vendidos** - Analytics integrado
- **Métodos de Pagamento** - Distribuição

## 🔧 [Troubleshooting](./troubleshooting.md)

### Problemas Comuns
- **Scanner não funciona** - Verificar configuração USB
- **Produtos não aparecem** - Verificar conexão Supabase
- **Carrinho trava** - Limpar cache do navegador
- **Desconto não salva** - Verificar permissões

### Soluções Rápidas
- **Refresh da página** - Resolve problemas temporários
- **Logout/Login** - Atualiza permissões
- **Verificar rede** - Problemas de conectividade

### Logs e Debug
- **Console do navegador** - Erros JavaScript
- **Network tab** - Problemas de API
- **Supabase logs** - Erros do backend

## 🧪 Testes

### Cobertura Atual
- **Componentes** - 85%+ testados
- **Hooks** - 90%+ testados
- **Integração** - Fluxos principais
- **E2E** - Cenários críticos

### Cenários de Teste
- **Venda Simples** - 1 produto, 1 pagamento
- **Venda Complexa** - Múltiplos produtos, desconto
- **Scanner** - Todos os tipos de código
- **Edge Cases** - Estoque zerado, rede offline

## 🚀 Roadmap

### Próximas Melhorias (v2.1)
- **Mobile Interface** - Otimização para tablets
- **Offline Mode** - Funcionar sem internet
- **Advanced Analytics** - Relatórios em tempo real
- **Printer Integration** - Impressão automática
- **Melhorias UX** - Feedback das melhorias responsivas implementadas

### Longo Prazo (v3.0)
- **AI Recommendations** - Sugestões inteligentes
- **Voice Commands** - Comandos por voz
- **Multi-location** - Suporte a filiais

## 📋 Configuração e Setup

### Requisitos
- **Hardware** - Scanner USB compatível
- **Software** - Navegador moderno, impressora
- **Rede** - Conexão estável com Supabase
- **Permissões** - Role adequado (admin/employee)

### Configuração Inicial
1. **Verificar Scanner** - Testar leitura de códigos
2. **Configurar Impressora** - Setup de cupom fiscal
3. **Testar Conexão** - Validar Supabase
4. **Treinar Usuários** - Workflow básico

---

**Status**: ✅ **MÓDULO CRÍTICO EM PRODUÇÃO**
**Responsabilidade**: Vendas presenciais e operação diária
**Prioridade**: ALTA - Sistema core do negócio