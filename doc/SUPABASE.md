# Documentação da Integração com Supabase

## Visão Geral

O Adega Manager utiliza o Supabase como plataforma de backend, aproveitando seus recursos de banco de dados PostgreSQL, autenticação, armazenamento e funções serverless.

## Gerenciamento de Roles

### Estrutura de Roles
O sistema utiliza três níveis de acesso:
- **admin**: Acesso total ao sistema
- **employee**: Acesso às funcionalidades de vendas e estoque
- **delivery**: Acesso apenas às funcionalidades de entrega

### Sincronização de Roles
É crucial manter a sincronização de roles entre as tabelas:
1. `auth.users`: Tabela do Supabase Auth
2. `public.users`: Tabela principal de usuários
3. `public.profiles`: Tabela de perfis

Ao criar um novo usuário:
```typescript
const createUser = async (email: string, password: string, role: 'admin' | 'employee' | 'delivery') => {
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) throw authError;
  
  // Inserir na tabela users
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      role
    });
    
  if (userError) throw userError;
  
  // Inserir na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email,
      role  // Importante: mesma role da tabela users
    });
    
  if (profileError) throw profileError;
};
```

### Verificação de Roles
Para garantir consistência, implemente verificações periódicas:
```sql
-- Identificar inconsistências entre users e profiles
SELECT u.id, u.email, u.role as user_role, p.role as profile_role
FROM users u
JOIN profiles p ON p.id = u.id
WHERE u.role != p.role;

-- Corrigir inconsistências
UPDATE profiles
SET role = users.role
FROM users
WHERE profiles.id = users.id
AND profiles.role != users.role;
```

### Troubleshooting de Roles

#### Problemas Comuns
1. **Role incorreta após criação de usuário**
   - Verificar se a role foi definida corretamente em ambas as tabelas
   - Executar query de verificação de inconsistências

2. **Usuário sem acesso apropriado**
   - Verificar role nas tabelas users e profiles
   - Confirmar que políticas RLS estão corretas
   - Verificar se o token JWT está atualizado

3. **Perda de acesso após atualização**
   - Fazer logout e login novamente para atualizar o token
   - Verificar consistência das roles nas tabelas

#### Queries de Diagnóstico
```sql
-- Verificar role de um usuário específico
SELECT 
  u.email,
  u.role as user_role,
  p.role as profile_role
FROM users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'usuario@exemplo.com';

-- Listar todos os usuários e suas roles
SELECT 
  u.email,
  u.role as user_role,
  p.role as profile_role,
  u.created_at
FROM users u
JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

## Configuração

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_key
```

### Cliente Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});
```

## Autenticação

### Configuração Inicial
1. Configure o domínio permitido no Supabase Dashboard
2. Personalize os templates de email
3. Configure os provedores de autenticação desejados

### Implementação

```typescript
// src/hooks/useAuth.ts
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Login realizado com sucesso');
      navigate('/');
      
      return data;
    } catch (error) {
      toast.error('Erro ao fazer login');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success('Email de recuperação enviado');
    } catch (error) {
      toast.error('Erro ao enviar email de recuperação');
      throw error;
    }
  };

  return {
    signIn,
    signOut,
    resetPassword
  };
};
```

## Banco de Dados

### Tipos
```typescript
// src/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock_quantity: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock_quantity?: number
          category: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          category?: string
        }
      }
      // ... outras tabelas
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_sale: {
        Args: {
          p_customer_id: string | null
          p_user_id: string
          p_items: Json
          p_payment_method: string
          p_delivery?: boolean
          p_delivery_address?: Json | null
          p_notes?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

### Queries e Mutations

#### Select
```typescript
// Hooks customizados para queries
const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
};

// Queries com joins
const useSaleDetails = (saleId: string) => {
  return useQuery({
    queryKey: ['sales', saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          items:sale_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', saleId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });
};

// Queries com filtros
const useFilteredProducts = (category: string) => {
  return useQuery({
    queryKey: ['products', { category }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
};
```

#### Insert
```typescript
// Mutations para inserção
const useAddProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase
        .from('products')
        .insert(data);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto adicionado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao adicionar produto');
    }
  });
};

// Inserção com upload de imagem
const useAddProductWithImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, image }: AddProductWithImageParams) => {
      // Upload da imagem
      const { data: imageData, error: imageError } = await supabase.storage
        .from('products')
        .upload(`${Date.now()}-${image.name}`, image);
        
      if (imageError) throw imageError;
      
      // Inserir produto com URL da imagem
      const { error } = await supabase
        .from('products')
        .insert({
          ...data,
          image_url: imageData.path
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto adicionado com sucesso');
    }
  });
};
```

#### Update
```typescript
// Mutations para atualização
const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: UpdateProductParams) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso');
    }
  });
};

// Atualização com otimistic update
const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quantity }: UpdateStockParams) => {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', id);
        
      if (error) throw error;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['products', id] });
      
      const previousProduct = queryClient.getQueryData(['products', id]);
      
      queryClient.setQueryData(['products', id], (old: any) => ({
        ...old,
        stock_quantity: quantity
      }));
      
      return { previousProduct };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['products', variables.id],
        context?.previousProduct
      );
      toast.error('Erro ao atualizar estoque');
    },
    onSuccess: () => {
      toast.success('Estoque atualizado com sucesso');
    }
  });
};
```

#### Delete
```typescript
// Mutations para deleção
const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido com sucesso');
    }
  });
};
```

### RLS (Row Level Security)

#### Políticas
```sql
-- Produtos
alter table public.products enable row level security;

-- Leitura pública
create policy "Public read access" on products
  for select using (true);

-- Gerenciamento apenas por staff
create policy "Staff can manage products" on products
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));

-- Vendas
alter table public.sales enable row level security;

-- Staff pode ver e gerenciar vendas
create policy "Staff can manage sales" on sales
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));

-- Clientes
alter table public.customers enable row level security;

-- Staff pode gerenciar clientes
create policy "Staff can manage customers" on customers
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));
```

## Storage

### Configuração
```typescript
// src/lib/storage.ts
import { supabase } from './supabase';

export const uploadProductImage = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error uploading image');
  }
};

export const deleteProductImage = async (url: string) => {
  try {
    const path = url.split('/').pop();
    if (!path) throw new Error('Invalid image URL');

    const { error } = await supabase.storage
      .from('products')
      .remove([`products/${path}`]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Error deleting image');
  }
};
```

## Boas Práticas

### 1. Segurança

#### Autenticação
- Use sempre HTTPS
- Implemente refresh tokens
- Limite tentativas de login
- Armazene tokens de forma segura

#### RLS
- Habilite RLS em todas as tabelas
- Crie políticas específicas
- Teste todas as políticas
- Use funções security definer com cautela

### 2. Performance

#### Queries
- Use índices apropriados
- Otimize JOINs
- Implemente paginação
- Cache resultados frequentes

#### Storage
- Otimize imagens antes do upload
- Use CDN para arquivos públicos
- Implemente limites de tamanho
- Valide tipos de arquivo

### 3. Error Handling

#### Cliente
```typescript
// Wrapper para requisições
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST301') {
    throw new Error('Não autorizado');
  }
  
  if (error.code === 'PGRST404') {
    throw new Error('Recurso não encontrado');
  }
  
  throw new Error('Erro interno do servidor');
};

// Uso
try {
  const { data, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) throw error;
  return data;
} catch (error) {
  handleSupabaseError(error);
}
```

#### Servidor
```sql
-- Função com tratamento de erro
create or replace function process_sale(...)
returns uuid
language plpgsql
security definer
as $$
begin
  -- Validações
  if not exists (...) then
    raise exception 'Validation error: %', error_message;
  end if;
  
  -- Operações em transação
  begin
    -- Suas operações aqui
    exception when others then
      raise exception 'Transaction failed: %', sqlerrm;
  end;
end;
$$;
```

### 4. Monitoramento

#### Logs
- Configure log levels apropriados
- Monitore erros de autenticação
- Acompanhe performance de queries
- Registre operações críticas

#### Alertas
- Configure alertas para:
  - Erros de autenticação
  - Queries lentas
  - Falhas em operações críticas
  - Uso excessivo de recursos

## Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   - Verifique tokens
   - Confirme domínios permitidos
   - Valide configurações de CORS

2. **Erro de RLS**
   - Verifique políticas
   - Confirme role do usuário
   - Teste com diferentes roles

3. **Performance**
   - Analise queries lentas
   - Otimize índices
   - Implemente caching

## Recomendações Finais

1. **Mantenha tipos atualizados**
2. **Use migrations para alterações**
3. **Implemente monitoramento**
4. **Mantenha backups regulares**
5. **Documente políticas RLS**
6. **Teste cenários de erro**
7. **Otimize queries críticas**
8. **Valide inputs do usuário**
9. **Use prepared statements**
10. **Mantenha logs organizados** 