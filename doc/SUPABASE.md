# Documentação da Integração com Supabase

## Visão Geral

O Adega Manager utiliza o Supabase como plataforma de backend, aproveitando seus recursos de banco de dados PostgreSQL, autenticação, armazenamento e funções serverless.

## Configuração

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### Inicialização do Cliente
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## Autenticação

### Configuração
- Auth server URL configurado
- Provedores de autenticação habilitados
- Redirecionamentos permitidos configurados
- Templates de email personalizados

### Implementação

```typescript
// src/hooks/useAuth.ts
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const supabase = useSupabaseClient();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
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
// src/lib/database.types.ts
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
          // ... outros campos
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock_quantity?: number
          category: string
          // ... outros campos
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          category?: string
          // ... outros campos
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

### Queries

#### Select
```typescript
// Buscar produtos
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('name');

// Buscar produto específico
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();

// Buscar com joins
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
  .order('created_at', { ascending: false });
```

#### Insert
```typescript
// Inserir produto
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Vinho Tinto',
    price: 99.90,
    category: 'tinto'
  })
  .select()
  .single();

// Inserir múltiplos
const { data, error } = await supabase
  .from('sale_items')
  .insert(items)
  .select();
```

#### Update
```typescript
// Atualizar produto
const { data, error } = await supabase
  .from('products')
  .update({
    stock_quantity: product.stock_quantity - quantity
  })
  .eq('id', productId)
  .select()
  .single();
```

#### Delete
```typescript
// Deletar produto
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
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
```

## Storage

### Configuração
```typescript
// src/lib/storage.ts
import { supabase } from './supabase';

export const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600'
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Políticas de Storage
```sql
-- Bucket público para imagens de produtos
insert into storage.buckets (id, name, public)
values ('products', 'products', true);

-- Apenas staff pode fazer upload
create policy "Staff can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'products' and
  auth.jwt() ->> 'role' in ('admin', 'employee')
);
```

## Realtime

### Subscrições
```typescript
// src/hooks/useRealtimeStock.ts
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeStock = (productId: string) => {
  const supabase = useSupabaseClient();
  const [stock, setStock] = useState<number>(0);
  
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Buscar estoque inicial
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      setStock(data.stock_quantity);

      // Subscrever a mudanças
      channel = supabase
        .channel('product_stock')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'products',
            filter: `id=eq.${productId}`
          },
          (payload) => {
            setStock(payload.new.stock_quantity);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [productId, supabase]);

  return stock;
};
```

## Edge Functions

### Configuração
```bash
# supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payment_method, amount } = await req.json()
    
    // Processar pagamento
    // Integração com gateway...

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### Uso
```typescript
const processPayment = async (paymentData: PaymentData) => {
  const { data, error } = await supabase.functions.invoke('process-payment', {
    body: JSON.stringify(paymentData)
  });
  
  if (error) throw error;
  return data;
};
```

## Boas Práticas

### 1. Segurança
- Use RLS para controle de acesso
- Nunca exponha chaves secretas
- Valide inputs no cliente e servidor
- Use prepared statements

### 2. Performance
- Use índices apropriados
- Otimize queries
- Implemente caching
- Use paginação

### 3. Manutenção
- Mantenha tipos atualizados
- Use migrations para alterações
- Documente funções e políticas
- Monitore uso de recursos

### 4. Error Handling
- Trate erros específicos
- Log de erros apropriado
- Mensagens amigáveis ao usuário
- Fallbacks quando apropriado

## Troubleshooting

### Problemas Comuns

1. **Erros de Autenticação**
   - Verifique configuração de URLs
   - Confirme chaves de API
   - Verifique políticas RLS
   - Valide tokens JWT

2. **Performance**
   - Analise queries lentas
   - Verifique índices
   - Otimize joins
   - Implemente caching

3. **Realtime**
   - Verifique limites de conexão
   - Confirme políticas de acesso
   - Monitore uso de recursos
   - Implemente reconexão 