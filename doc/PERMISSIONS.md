# Sistema de Permissões do Adega Manager

## Visão Geral

O Adega Manager implementa um sistema de controle de acesso baseado em roles (RBAC - Role Based Access Control) para garantir que cada usuário tenha acesso apenas às funcionalidades necessárias para sua função.

## Roles Disponíveis

### 1. Admin
- **Descrição**: Acesso total ao sistema
- **Permissões**:
  - Gerenciar usuários (criar, editar, excluir)
  - Gerenciar produtos e estoque
  - Gerenciar vendas
  - Visualizar relatórios
  - Configurar sistema
  - Acessar todas as seções do sistema

### 2. Employee (Funcionário)
- **Descrição**: Acesso às operações do dia a dia
- **Permissões**:
  - Realizar vendas
    - Criar novas vendas
    - Aplicar descontos (até limite configurado)
    - Gerenciar itens do carrinho
    - Processar pagamentos
    - Emitir comprovantes
  - Gerenciar produtos e estoque
  - Visualizar relatórios básicos de vendas
  - Atender clientes
  - Registrar entregas
  - Visualizar histórico de vendas próprias
  - Cancelar vendas (com justificativa)

### 3. Seller (Vendedor)
- **Descrição**: Acesso completo ao módulo de vendas
- **Permissões**:
  - Todas as permissões de Employee
  - Aplicar descontos especiais
  - Visualizar relatórios de vendas da equipe
  - Gerenciar devoluções
  - Acessar métricas de desempenho
  - Visualizar histórico de vendas da equipe

### 4. Delivery (Entregador)
- **Descrição**: Acesso apenas às funcionalidades de entrega
- **Permissões**:
  - Visualizar entregas designadas
  - Atualizar status de entregas
  - Visualizar endereços de entrega
  - Registrar conclusão de entregas

## Implementação Técnica

### Estrutura de Dados
O sistema mantém as roles em três locais:
1. `auth.users`: Tabela do Supabase Auth
2. `public.users`: Tabela principal de usuários
3. `public.profiles`: Tabela de perfis estendidos

### Sincronização
- As roles devem estar sempre sincronizadas entre as tabelas
- A tabela `users` é considerada a fonte principal da role
- Ao criar ou atualizar usuários, todas as tabelas devem ser atualizadas

### Verificação de Acesso
```typescript
// Exemplo de verificação de permissão no frontend
const checkPermission = (requiredRole: 'admin' | 'employee' | 'delivery') => {
  const user = useUser();
  const userRole = user?.role;

  if (!userRole) return false;
  
  switch (requiredRole) {
    case 'admin':
      return userRole === 'admin';
    case 'employee':
      return userRole === 'admin' || userRole === 'employee';
    case 'delivery':
      return userRole === 'delivery';
    default:
      return false;
  }
};
```

### Políticas RLS
#### Vendas
```sql
-- Vendedores podem ver suas próprias vendas
CREATE POLICY "Sellers can view their sales" ON sales
FOR SELECT USING (
  auth.role() IN ('admin', 'employee', 'seller')
  AND seller_id = auth.uid()
);

-- Vendedores podem criar vendas
CREATE POLICY "Sellers can create sales" ON sales
FOR INSERT WITH CHECK (
  auth.role() IN ('admin', 'employee', 'seller')
  AND seller_id = auth.uid()
);

-- Apenas admins podem cancelar vendas
CREATE POLICY "Only admins can cancel sales" ON sales
FOR UPDATE USING (
  (auth.role() = 'admin' AND status = 'cancelled')
  OR (auth.role() IN ('seller', 'employee') AND status != 'cancelled')
);

-- Itens de venda são visíveis para quem pode ver a venda
CREATE POLICY "Sale items are visible to sale viewers" ON sale_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE id = sale_id 
    AND (
      seller_id = auth.uid() 
      OR auth.role() = 'admin'
    )
  )
);
```

#### Produtos
```sql
-- Funcionários podem gerenciar produtos
CREATE POLICY "Employees can manage products" ON products
FOR ALL USING (
  auth.role() IN ('admin', 'employee', 'seller')
);
```

#### Entregas
```sql
-- Entregadores podem ver apenas suas entregas
CREATE POLICY "Delivery users can view assigned deliveries" ON sales
FOR SELECT USING (
  auth.role() = 'delivery' 
  AND delivery_user_id = auth.uid()
);
```

## Interface do Usuário

#### Módulo de Vendas
- **Ponto de Venda (PDV)**
  - Acesso: Vendedor, Funcionário, Admin
  - Funcionalidades: 
    - Carrinho de compras
    - Busca de produtos
    - Seleção de cliente
    - Aplicação de descontos
    - Processamento de pagamentos

- **Histórico de Vendas**
  - Acesso: Vendedor (próprias vendas), Funcionário (todas), Admin
  - Filtros por data, vendedor, status

- **Relatórios de Vendas**
  - Acesso: Vendedor (métricas próprias), Funcionário/Admin (completo)
  - Gráficos e métricas
  - Exportação de dados

#### Sidebar/Menu
- O menu lateral é filtrado com base na role do usuário
- Apenas as seções permitidas são exibidas
- A navegação é restrita via rotas protegidas

### Componentes
- Botões e ações são condicionalmente renderizados
- Feedback visual claro quando acesso é negado
- Loading states durante verificação de permissões

## Boas Práticas

### Segurança
1. **Sempre verificar permissões em múltiplas camadas**:
   - Frontend (UI)
   - Backend (API)
   - Banco de dados (RLS)

2. **Nunca confiar apenas em verificações do cliente**:
   - Implementar RLS no banco
   - Validar permissões em APIs
   - Usar middleware de autenticação

3. **Manter logs de acesso**:
   - Registrar tentativas de acesso não autorizado
   - Monitorar padrões suspeitos
   - Auditar alterações de permissões

### Manutenção
1. **Documentar alterações**:
   - Manter lista de roles atualizada
   - Documentar novas permissões
   - Registrar decisões de design

2. **Testar mudanças**:
   - Verificar impacto em usuários existentes
   - Testar fluxos de autorização
   - Validar restrições de acesso

3. **Monitorar problemas**:
   - Acompanhar reports de usuários
   - Verificar logs de erro
   - Manter scripts de diagnóstico

## Troubleshooting

### Problemas Comuns

1. **Usuário sem acesso apropriado**
   - Verificar role nas tabelas users e profiles
   - Confirmar políticas RLS
   - Validar token JWT

2. **Inconsistência de Permissões**
   - Executar queries de verificação
   - Sincronizar roles entre tabelas
   - Limpar cache de permissões

3. **Erro após Atualização**
   - Fazer logout/login
   - Verificar consistência de dados
   - Atualizar token JWT

### Scripts de Diagnóstico

#### Verificar Inconsistências de Funções
```sql
-- Verificar inconsistências de roles
SELECT u.id, u.email, u.role as user_role, p.role as profile_role
FROM users u
JOIN profiles p ON p.id = u.id
WHERE u.role != p.role;

-- Corrigir roles
UPDATE profiles
SET role = users.role
FROM users
WHERE profiles.id = users.id
AND profiles.role != users.role;
```

#### Verificar Permissões de Vendas
```sql
-- Verificar vendas sem vendedor
SELECT id, created_at, status 
FROM sales 
WHERE seller_id IS NULL;

-- Verificar descontos acima do permitido
SELECT s.id, s.seller_id, s.discount_amount, s.total_amount,
       (s.discount_amount / NULLIF(s.total_amount, 0)) * 100 as discount_percentage
FROM sales s
WHERE (s.discount_amount / NULLIF(s.total_amount, 0)) > 0.2; -- Mais de 20% de desconto

-- Verificar vendas canceladas sem justificativa
SELECT id, seller_id, status, notes
FROM sales
WHERE status = 'cancelled' 
AND (notes IS NULL OR notes = '');
```

#### Monitoramento de Atividades
```sql
-- Vendas por vendedor
SELECT 
  u.email as seller,
  COUNT(s.id) as total_sales,
  SUM(s.final_amount) as total_amount,
  AVG(s.final_amount) as average_ticket
FROM sales s
JOIN users u ON s.seller_id = u.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.email
ORDER BY total_amount DESC;
```

## Fluxos de Trabalho Específicos

### Processo de Venda
1. **Seleção de Cliente**
   - Buscar cliente existente
   - Opção para cadastro rápido
   - Verificação de restrições (inadimplência, etc.)

2. **Adição de Itens**
   - Busca de produtos por código ou nome
   - Verificação de estoque em tempo real
   - Aplicação de preços especiais

3. **Pagamento**
   - Seleção de método de pagamento
   - Cálculo de troco
   - Processamento da transação
   - Emissão de comprovante

4. **Pós-venda**
   - Atualização de estoque
   - Registro no histórico do cliente
   - Geração de métricas

## Fluxo de Criação de Usuário

1. **Admin inicia criação**:
   - Fornece email e role
   - Sistema gera senha temporária

2. **Sistema cria registros**:
   - Insere em auth.users
   - Insere em public.users
   - Insere em public.profiles
   - Verifica consistência

3. **Usuário primeiro acesso**:
   - Login com senha temporária
   - Forçar troca de senha
   - Validar permissões

4. **Sistema mantém sincronização**:
   - Monitora alterações
   - Corrige inconsistências
   - Registra mudanças
``` 