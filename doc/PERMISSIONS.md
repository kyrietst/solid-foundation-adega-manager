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
  - Gerenciar produtos e estoque
  - Visualizar relatórios básicos
  - Atender clientes
  - Registrar entregas

### 3. Delivery (Entregador)
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
```sql
-- Exemplo de política para produtos
CREATE POLICY "Employees can manage products" ON products
FOR ALL USING (
  auth.role() IN ('admin', 'employee')
);

-- Exemplo de política para entregas
CREATE POLICY "Delivery users can view assigned deliveries" ON sales
FOR SELECT USING (
  auth.role() = 'delivery' 
  AND delivery_user_id = auth.uid()
);
```

## Interface do Usuário

### Sidebar/Menu
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
```sql
-- Verificar inconsistências
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