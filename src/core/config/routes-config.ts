/**
 * Configuração de rotas para o sistema de breadcrumb
 * Enhanced for Story 2.3: Hierarchical navigation system
 */

import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  ArrowUpDown, 
  UserCog, 
  FileText 
} from 'lucide-react';

export interface RouteConfig {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  children?: Record<string, RouteConfig>;
  permissions?: string[];
}

export const routesConfig: Record<string, RouteConfig> = {
  dashboard: {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    description: 'Visão geral do sistema',
    permissions: ['admin', 'employee']
  },
  
  sales: {
    label: 'Vendas',
    path: '/sales',
    icon: ShoppingCart,
    description: 'Sistema de vendas e POS',
    permissions: ['admin', 'employee'],
    children: {
      pos: {
        label: 'Ponto de Venda',
        path: '/sales/pos',
        description: 'Sistema POS para vendas'
      },
      history: {
        label: 'Histórico de Vendas',
        path: '/sales/history',
        description: 'Histórico e relatórios de vendas'
      }
    }
  },
  
  inventory: {
    label: 'Estoque',
    path: '/inventory',
    icon: Package,
    description: 'Gestão de inventário',
    permissions: ['admin', 'employee'],
    children: {
      products: {
        label: 'Produtos',
        path: '/inventory/products',
        description: 'Cadastro e gestão de produtos'
      },
      categories: {
        label: 'Categorias',
        path: '/inventory/categories',
        description: 'Gestão de categorias de produtos'
      },
      lowstock: {
        label: 'Estoque Baixo',
        path: '/inventory/lowstock',
        description: 'Produtos com estoque baixo'
      }
    }
  },
  
  customers: {
    label: 'Clientes',
    path: '/customers',
    icon: Users,
    description: 'CRM e gestão de clientes',
    permissions: ['admin', 'employee'],
    children: {
      list: {
        label: 'Lista de Clientes',
        path: '/customers/list',
        description: 'Todos os clientes cadastrados'
      },
      segments: {
        label: 'Segmentação',
        path: '/customers/segments',
        description: 'Segmentos de clientes'
      },
      insights: {
        label: 'Insights',
        path: '/customers/insights',
        description: 'Análises e insights de clientes'
      }
    }
  },
  
  delivery: {
    label: 'Entregas',
    path: '/delivery',
    icon: Truck,
    description: 'Gestão de entregas',
    permissions: ['admin', 'employee', 'delivery'],
    children: {
      pending: {
        label: 'Pendentes',
        path: '/delivery/pending',
        description: 'Entregas pendentes'
      },
      intransit: {
        label: 'Em Trânsito',
        path: '/delivery/intransit',
        description: 'Entregas em andamento'
      },
      completed: {
        label: 'Concluídas',
        path: '/delivery/completed',
        description: 'Entregas finalizadas'
      }
    }
  },
  
  movements: {
    label: 'Movimentações',
    path: '/movements',
    icon: ArrowUpDown,
    description: 'Movimentações de estoque',
    permissions: ['admin'],
    children: {
      in: {
        label: 'Entradas',
        path: '/movements/in',
        description: 'Entradas de estoque'
      },
      out: {
        label: 'Saídas',
        path: '/movements/out',
        description: 'Saídas de estoque'
      },
      fiado: {
        label: 'Fiado',
        path: '/movements/fiado',
        description: 'Vendas fiado'
      },
      returns: {
        label: 'Devoluções',
        path: '/movements/returns',
        description: 'Devoluções de produtos'
      }
    }
  },
  
  users: {
    label: 'Usuários',
    path: '/users',
    icon: UserCog,
    description: 'Gestão de usuários',
    permissions: ['admin'],
    children: {
      list: {
        label: 'Lista de Usuários',
        path: '/users/list',
        description: 'Todos os usuários do sistema'
      },
      roles: {
        label: 'Permissões',
        path: '/users/roles',
        description: 'Gestão de permissões e roles'
      },
      activity: {
        label: 'Atividade',
        path: '/users/activity',
        description: 'Log de atividades dos usuários'
      }
    }
  },
  
  reports: {
    label: 'Relatórios',
    path: '/reports',
    icon: FileText,
    description: 'Relatórios e análises',
    permissions: ['admin', 'employee'],
    children: {
      sales: {
        label: 'Relatórios de Vendas',
        path: '/reports/sales',
        description: 'Análises de vendas'
      },
      inventory: {
        label: 'Relatórios de Estoque',
        path: '/reports/inventory',
        description: 'Análises de inventário'
      },
      customers: {
        label: 'Relatórios de Clientes',
        path: '/reports/customers',
        description: 'Análises de CRM'
      },
      financial: {
        label: 'Relatórios Financeiros',
        path: '/reports/financial',
        description: 'Análises financeiras'
      }
    }
  }
};

// Função helper para encontrar configuração de rota
export const findRouteConfig = (path: string): RouteConfig | null => {
  const segments = path.split('/').filter(Boolean);
  
  let current = routesConfig;
  let config: RouteConfig | null = null;
  
  for (const segment of segments) {
    if (current[segment]) {
      config = current[segment];
      current = config.children || {};
    } else {
      return null;
    }
  }
  
  return config;
};

// Função helper para gerar breadcrumb baseado no path
export const generateBreadcrumbFromPath = (path: string): Array<{
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}> => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  let currentPath = '';
  let currentConfig = routesConfig;
  
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    if (currentConfig[segment]) {
      const config = currentConfig[segment];
      breadcrumbs.push({
        label: config.label,
        path: config.path,
        icon: config.icon
      });
      currentConfig = config.children || {};
    } else {
      // Fallback para segmentos não configurados
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      });
    }
  }
  
  return breadcrumbs;
};