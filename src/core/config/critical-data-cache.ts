/**
 * Cache inteligente para dados críticos
 * Armazena dados essenciais localmente para acesso offline
 */

import type { Product } from '@/core/types/inventory.types';
import type { CustomerProfile } from '@/features/customers/hooks/use-crm';

export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
  key: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'products' | 'customers' | 'sales' | 'settings' | 'user' | 'system';
}

export interface CacheConfig {
  maxSize: number; // Número máximo de itens
  defaultTTL: number; // TTL padrão em ms
  cleanupInterval: number; // Intervalo de limpeza em ms
  compressionEnabled: boolean;
}

class CriticalDataCache {
  private static instance: CriticalDataCache;
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private storageKey = 'critical_data_cache';

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 500,
      defaultTTL: 30 * 60 * 1000, // 30 minutos
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      compressionEnabled: true,
      ...config
    };

    this.loadFromStorage();
    this.startCleanupInterval();
  }

  public static getInstance(config?: Partial<CacheConfig>): CriticalDataCache {
    if (!CriticalDataCache.instance) {
      CriticalDataCache.instance = new CriticalDataCache(config);
    }
    return CriticalDataCache.instance;
  }

  // Carregar cache do localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.items);
        console.log(`📦 Cache carregado: ${this.cache.size} itens`);
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
      this.cache.clear();
    }
  }

  // Salvar cache no localStorage
  private saveToStorage(): void {
    try {
      const data = {
        items: Array.from(this.cache.entries()),
        lastSaved: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
      // Se falhar, tentar limpar itens menos importantes
      this.evictLowPriorityItems();
      try {
        const data = {
          items: Array.from(this.cache.entries()),
          lastSaved: Date.now()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (retryError) {
        console.error('Falha crítica ao salvar cache:', retryError);
      }
    }
  }

  // Iniciar intervalo de limpeza
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Limpeza de itens expirados
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: ${cleaned} itens removidos`);
      this.saveToStorage();
    }

    // Se ainda está acima do limite, remover por prioridade
    if (this.cache.size > this.config.maxSize) {
      this.evictLowPriorityItems();
    }
  }

  // Remover itens de baixa prioridade
  private evictLowPriorityItems(): void {
    const items = Array.from(this.cache.entries());
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    
    // Ordenar por prioridade (baixa primeiro) e depois por timestamp (mais antigo primeiro)
    items.sort(([, a], [, b]) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Remover itens até chegar ao limite
    const toRemove = this.cache.size - Math.floor(this.config.maxSize * 0.8);
    for (let i = 0; i < toRemove && i < items.length; i++) {
      const [key] = items[i];
      this.cache.delete(key);
    }

    console.log(`🗑️ Evicted ${toRemove} itens de baixa prioridade`);
    this.saveToStorage();
  }

  // Definir item no cache
  public set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: CacheItem['priority'];
      category?: CacheItem['category'];
    } = {}
  ): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      key,
      priority: options.priority || 'medium',
      category: options.category || 'system'
    };

    this.cache.set(key, item);

    // Se passou do limite, limpar
    if (this.cache.size > this.config.maxSize) {
      this.evictLowPriorityItems();
    }

    this.saveToStorage();
  }

  // Obter item do cache
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Verificar se expirou
    const now = Date.now();
    if (now > item.timestamp + item.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data as T;
  }

  // Verificar se item existe e é válido
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remover item
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Limpar cache por categoria
  public clearCategory(category: CacheItem['category']): void {
    let cleared = 0;
    for (const [key, item] of this.cache.entries()) {
      if (item.category === category) {
        this.cache.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      console.log(`🗂️ Cleared ${cleared} itens da categoria ${category}`);
      this.saveToStorage();
    }
  }

  // Limpar cache por prioridade
  public clearByPriority(priority: CacheItem['priority']): void {
    let cleared = 0;
    for (const [key, item] of this.cache.entries()) {
      if (item.priority === priority) {
        this.cache.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      console.log(`⚡ Cleared ${cleared} itens de prioridade ${priority}`);
      this.saveToStorage();
    }
  }

  // Limpar todo o cache
  public clear(): void {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
    console.log('🧽 Cache completamente limpo');
  }

  // Obter estatísticas do cache
  public getStats(): {
    size: number;
    maxSize: number;
    categories: Record<string, number>;
    priorities: Record<string, number>;
    oldestItem: number;
    newestItem: number;
  } {
    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    let oldestItem = Date.now();
    let newestItem = 0;

    for (const item of this.cache.values()) {
      categories[item.category] = (categories[item.category] || 0) + 1;
      priorities[item.priority] = (priorities[item.priority] || 0) + 1;
      oldestItem = Math.min(oldestItem, item.timestamp);
      newestItem = Math.max(newestItem, item.timestamp);
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      categories,
      priorities,
      oldestItem: this.cache.size > 0 ? oldestItem : 0,
      newestItem: this.cache.size > 0 ? newestItem : 0
    };
  }

  // Cache para produtos críticos
  public cacheProducts(products: Product[]): void {
    products.forEach(product => {
      this.set(`product_${product.id}`, product, {
        category: 'products',
        priority: 'high',
        ttl: 60 * 60 * 1000 // 1 hora
      });
    });
  }

  // Cache para dados de clientes
  public cacheCustomers(customers: CustomerProfile[]): void {
    customers.forEach(customer => {
      this.set(`customer_${customer.id}`, customer, {
        category: 'customers',
        priority: 'medium',
        ttl: 30 * 60 * 1000 // 30 minutos
      });
    });
  }

  // Cache para configurações do sistema
  public cacheSettings(settings: Record<string, unknown>): void {
    Object.entries(settings).forEach(([key, value]) => {
      this.set(`setting_${key}`, value, {
        category: 'settings',
        priority: 'critical',
        ttl: 24 * 60 * 60 * 1000 // 24 horas
      });
    });
  }

  // Obter produtos do cache
  public getCachedProducts(): Product[] {
    const products: Product[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith('product_') && item.category === 'products') {
        const data = this.get(key);
        if (data) products.push(data as Product);
      }
    }
    return products;
  }

  // Obter clientes do cache
  public getCachedCustomers(): CustomerProfile[] {
    const customers: CustomerProfile[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith('customer_') && item.category === 'customers') {
        const data = this.get(key);
        if (data) customers.push(data as CustomerProfile);
      }
    }
    return customers;
  }

  // Destructor
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.saveToStorage();
  }
}

// Instância global
export const criticalDataCache = CriticalDataCache.getInstance();

// Hook para usar cache em componentes React
export const useCriticalDataCache = () => {
  return {
    set: criticalDataCache.set.bind(criticalDataCache),
    get: criticalDataCache.get.bind(criticalDataCache),
    has: criticalDataCache.has.bind(criticalDataCache),
    delete: criticalDataCache.delete.bind(criticalDataCache),
    clear: criticalDataCache.clear.bind(criticalDataCache),
    clearCategory: criticalDataCache.clearCategory.bind(criticalDataCache),
    getStats: criticalDataCache.getStats.bind(criticalDataCache),
    cacheProducts: criticalDataCache.cacheProducts.bind(criticalDataCache),
    cacheCustomers: criticalDataCache.cacheCustomers.bind(criticalDataCache),
    cacheSettings: criticalDataCache.cacheSettings.bind(criticalDataCache),
    getCachedProducts: criticalDataCache.getCachedProducts.bind(criticalDataCache),
    getCachedCustomers: criticalDataCache.getCachedCustomers.bind(criticalDataCache)
  };
};