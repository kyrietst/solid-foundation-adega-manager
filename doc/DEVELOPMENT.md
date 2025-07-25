# Guia de Desenvolvimento - Adega Manager

## Visão Geral

Este documento consolida todas as informações necessárias para desenvolver e contribuir com o Adega Manager, incluindo configuração do ambiente, padrões de código, guias de contribuição e boas práticas.

---

## 1. Configuração do Ambiente

### Requisitos

- **Node.js**: 18+ (recomendado 20+)
- **npm**: 9+ ou yarn 1.22+
- **Git**: Para controle de versão
- **Editor**: VS Code (recomendado)

### Instalação

```bash
# 1. Clonar repositório
git clone [url-do-repositorio]
cd solid-foundation-adega-manager

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Executar aplicação
npm run dev
```

### Configuração do VS Code

#### Extensões Recomendadas

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-react-jsx"
  ]
}
```

#### Settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "tailwindCSS.experimental.classRegex": [
    "cn\\(([^)]*)\\)"
  ]
}
```

### Configuração do Git

```bash
# Configurar informações do usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"

# Configurar editor padrão
git config --global core.editor "code --wait"

# Configurar line endings (Windows)
git config --global core.autocrlf true

# Configurar line endings (Mac/Linux)
git config --global core.autocrlf input
```

---

## 2. Estrutura do Projeto

### Organização de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Shadcn/ui)
│   ├── forms/          # Componentes de formulário
│   ├── layout/         # Componentes de layout
│   ├── reports/        # Componentes de relatórios
│   └── [feature]/      # Componentes específicos de funcionalidade
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
│   ├── use-auth.ts     # Hook de autenticação
│   ├── use-[feature].ts # Hooks específicos
│   └── reports/        # Hooks de relatórios
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente e tipos Supabase
├── lib/                # Utilitários e configurações
│   ├── utils.ts        # Funções utilitárias
│   ├── constants.ts    # Constantes da aplicação
│   └── validations.ts  # Schemas de validação
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── styles/             # Estilos globais
```

### Convenções de Nomenclatura

#### Arquivos e Pastas

```
# Componentes - PascalCase
CustomerDetail.tsx
ProductForm.tsx
SalesReport.tsx

# Hooks - camelCase com prefixo 'use'
useCustomers.ts
useProductForm.ts
useSalesReport.ts

# Utilitários - camelCase
formatCurrency.ts
validateEmail.ts
dateHelpers.ts

# Tipos - PascalCase
Customer.ts
Product.ts
Sale.ts

# Constantes - camelCase
apiEndpoints.ts
routePaths.ts
```

#### Variáveis e Funções

```typescript
// Variáveis - camelCase
const userName = 'João';
const totalAmount = 150.00;

// Funções - camelCase
function calculateTotal(items: CartItem[]): number {}
const handleSubmit = (data: FormData) => {};

// Constantes - UPPER_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_ITEMS_PER_PAGE = 50;

// Tipos e Interfaces - PascalCase
interface Customer {
  id: string;
  name: string;
}

type UserRole = 'admin' | 'employee' | 'delivery';
```

---

## 3. Padrões de Código

### Componentes React

#### Estrutura Básica

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // Propriedades específicas
}

const Component: React.FC<ComponentProps> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {children}
    </div>
  );
};

export default Component;
```

#### Componentes com Estado

```tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Props {
  initialData?: Data;
  onDataChange?: (data: Data) => void;
}

const DataComponent: React.FC<Props> = ({ 
  initialData, 
  onDataChange 
}) => {
  const [localState, setLocalState] = useState(initialData);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });

  useEffect(() => {
    if (data && onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Conteúdo do componente */}
    </div>
  );
};

export default DataComponent;
```

### Hooks Customizados

#### Hook de Dados

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: CreateCustomerInput) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};
```

#### Hook de Formulário

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido')
});

type FormData = z.infer<typeof formSchema>;

export const useCustomerForm = (initialData?: Partial<FormData>) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      ...initialData
    }
  });

  const handleSubmit = (data: FormData) => {
    // Lógica de submissão
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
};
```

### Validação de Dados

#### Schemas com Zod

```typescript
import { z } from 'zod';

// Schema para cliente
export const customerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(
    /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    'Telefone deve estar no formato (XX) XXXXX-XXXX'
  ).optional(),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
  }).optional(),
  birthday: z.date().optional(),
  notes: z.string().optional()
});

// Schema para produto
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  cost_price: z.number().positive('Preço de custo deve ser positivo').optional(),
  stock_quantity: z.number().min(0, 'Estoque não pode ser negativo'),
  minimum_stock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  // Campos específicos para vinhos
  vintage: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  producer: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  alcohol_content: z.number().min(0).max(100).optional(),
  volume: z.number().positive().optional()
});

// Tipos TypeScript derivados
export type Customer = z.infer<typeof customerSchema>;
export type Product = z.infer<typeof productSchema>;
```

### Utilitários Comuns

#### Formatação

```typescript
// lib/formatters.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};
```

#### Validadores

```typescript
// lib/validators.ts
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  
  return true;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned[13])) return false;
  
  return true;
};
```

---

## 4. Integração com Supabase

### Configuração do Cliente

```typescript
// integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

### Tipos TypeScript

```typescript
// integrations/supabase/types.ts
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: Json | null;
          birthday: string | null;
          contact_preference: string | null;
          contact_permission: boolean;
          first_purchase_date: string | null;
          last_purchase_date: string | null;
          purchase_frequency: string | null;
          lifetime_value: number;
          favorite_category: string | null;
          favorite_product: string | null;
          segment: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          birthday?: string | null;
          contact_preference?: string | null;
          contact_permission?: boolean;
          first_purchase_date?: string | null;
          last_purchase_date?: string | null;
          purchase_frequency?: string | null;
          lifetime_value?: number;
          favorite_category?: string | null;
          favorite_product?: string | null;
          segment?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          birthday?: string | null;
          contact_preference?: string | null;
          contact_permission?: boolean;
          first_purchase_date?: string | null;
          last_purchase_date?: string | null;
          purchase_frequency?: string | null;
          lifetime_value?: number;
          favorite_category?: string | null;
          favorite_product?: string | null;
          segment?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Outras tabelas...
    };
    Functions: {
      get_customer_insights: {
        Args: { customer_id: string };
        Returns: CustomerInsight[];
      };
      // Outras funções...
    };
  };
}
```

### Hooks de Dados

```typescript
// hooks/useSupabaseQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: any
) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options
  });
};

export const useSupabaseMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: any
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      options?.onSuccess?.(data, variables);
    },
    ...options
  });
};
```

### Real-time Subscriptions

```typescript
// hooks/useRealtimeSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeSubscription = <T>(
  table: string,
  filter?: string,
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: event || '*',
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          setData(currentData => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...currentData, payload.new as T];
              case 'UPDATE':
                return currentData.map(item => 
                  (item as any).id === payload.new.id 
                    ? payload.new as T 
                    : item
                );
              case 'DELETE':
                return currentData.filter(item => 
                  (item as any).id !== payload.old.id
                );
              default:
                return currentData;
            }
          });
        }
      )
      .subscribe();

    // Carregar dados iniciais
    const fetchInitialData = async () => {
      const { data: initialData, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error('Erro ao carregar dados:', error);
      } else {
        setData(initialData || []);
      }
      setLoading(false);
    };

    fetchInitialData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, event]);

  return { data, loading };
};
```

---

## 5. Testes

### Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Testes de Componentes

```typescript
// components/__tests__/CustomerForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerForm from '../CustomerForm';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('CustomerForm', () => {
  it('should render form fields', () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const submitButton = screen.getByText(/salvar/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <TestWrapper>
        <CustomerForm onSubmit={mockOnSubmit} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByText(/salvar/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@email.com'
      });
    });
  });
});
```

### Testes de Hooks

```typescript
// hooks/__tests__/useCustomers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCustomers } from '../useCustomers';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          then: jest.fn(() => Promise.resolve({
            data: [
              { id: '1', name: 'João Silva', email: 'joao@email.com' },
              { id: '2', name: 'Maria Santos', email: 'maria@email.com' }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('useCustomers', () => {
  it('should fetch customers successfully', async () => {
    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { id: '1', name: 'João Silva', email: 'joao@email.com' },
      { id: '2', name: 'Maria Santos', email: 'maria@email.com' }
    ]);
  });
});
```

### Testes de Integração

```typescript
// tests/integration/CustomerFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const IntegrationTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Customer Management Flow', () => {
  it('should allow creating a new customer', async () => {
    render(
      <IntegrationTestWrapper>
        <App />
      </IntegrationTestWrapper>
    );

    // Navegar para página de clientes
    fireEvent.click(screen.getByText(/clientes/i));

    // Clicar em novo cliente
    fireEvent.click(screen.getByText(/novo cliente/i));

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@email.com' }
    });

    // Submeter formulário
    fireEvent.click(screen.getByText(/salvar/i));

    // Verificar sucesso
    await waitFor(() => {
      expect(screen.getByText(/cliente criado com sucesso/i)).toBeInTheDocument();
    });
  });
});
```

---

## 6. Deployment

### Configuração de Ambientes

#### Development

```env
NODE_ENV=development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

#### Staging

```env
NODE_ENV=staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
```

#### Production

```env
NODE_ENV=production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

### Build e Deploy

```bash
# Build para produção
npm run build

# Verificar build
npm run preview

# Deploy (exemplo com Vercel)
npm i -g vercel
vercel --prod
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 7. Boas Práticas

### Performance

#### Lazy Loading

```typescript
// Carregamento de rotas
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Customers = lazy(() => import('../pages/Customers'));
const Sales = lazy(() => import('../pages/Sales'));

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/sales" element={<Sales />} />
      </Routes>
    </Suspense>
  );
}
```

#### Otimização de Componentes

```typescript
// Usar React.memo para componentes que não mudam frequentemente
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* Renderização complexa */}</div>;
});

// Usar useMemo para cálculos pesados
const Component = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>{expensiveValue}</div>;
};

// Usar useCallback para funções que são passadas como props
const ParentComponent = () => {
  const handleClick = useCallback((id: string) => {
    // Lógica do clique
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

### Segurança

#### Validação de Entrada

```typescript
// Sempre validar dados no frontend E backend
const validateInput = (input: string): string => {
  // Remover caracteres perigosos
  const cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Escapar HTML
  const escaped = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return escaped;
};
```

#### Tratamento de Erros

```typescript
// Error boundary para capturar erros
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Algo deu errado. Tente recarregar a página.</div>;
    }

    return this.props.children;
  }
}
```

### Acessibilidade

#### Componentes Acessíveis

```typescript
// Usar labels apropriados
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />

// Adicionar ARIA attributes
<button 
  aria-label="Fechar modal"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <CloseIcon />
</button>

// Navegação por teclado
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};
```

---

## 8. Troubleshooting

### Problemas Comuns

#### Erro de Hydration

```
Warning: Text content did not match. Server: "X" Client: "Y"
```

**Solução**: Verificar se há diferenças entre renderização servidor/cliente.

#### Erro de Memory Leak

```
Warning: Can't perform a React state update on an unmounted component
```

**Solução**: Limpar subscriptions e timers no useEffect cleanup.

```typescript
useEffect(() => {
  const subscription = api.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

#### Erro de CORS

```
Access to fetch at 'API_URL' from origin 'LOCAL_URL' has been blocked by CORS policy
```

**Solução**: Configurar CORS no Supabase ou usar proxy no desenvolvimento.

### Debugging

#### React DevTools

```typescript
// Adicionar display name para debugging
const MyComponent = () => {
  return <div>Content</div>;
};

MyComponent.displayName = 'MyComponent';
```

#### Console Debugging

```typescript
// Logging estruturado
const debug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

---

## 9. Contribuição

### Fluxo de Contribuição

1. **Fork** do repositório
2. **Criar branch** para feature: `git checkout -b feature/nome-da-feature`
3. **Implementar** mudanças seguindo os padrões
4. **Adicionar testes** para novas funcionalidades
5. **Commit** com mensagem descritiva
6. **Push** para o branch: `git push origin feature/nome-da-feature`
7. **Abrir Pull Request**

### Padrões de Commit

```bash
# Formato: tipo(escopo): descrição

# Tipos:
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção

# Exemplos:
git commit -m "feat(customers): adiciona validação de CPF"
git commit -m "fix(sales): corrige cálculo de desconto"
git commit -m "docs(readme): atualiza instruções de instalação"
```

### Code Review

#### Checklist do Revisor

- [ ] Código segue os padrões estabelecidos
- [ ] Funcionalidade está testada
- [ ] Documentação está atualizada
- [ ] Não há vazamentos de memória
- [ ] Performance está adequada
- [ ] Acessibilidade foi considerada
- [ ] Segurança foi considerada

### Recursos Úteis

#### Documentação

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

#### Ferramentas

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vite Documentation](https://vitejs.dev/)

Este guia deve ser atualizado conforme o projeto evolui e novas práticas são adotadas pela equipe.