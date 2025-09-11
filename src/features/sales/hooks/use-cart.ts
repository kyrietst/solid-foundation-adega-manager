import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  type: 'unit' | 'package'; // Novo campo para diferenciar
  packageUnits?: number; // Quantas unidades tem no pacote
  displayName?: string; // Nome customizado para exibição
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'displayName'>) => void;
  updateItemQuantity: (productId: string, type: 'unit' | 'package', quantity: number) => void;
  removeItem: (productId: string, type: 'unit' | 'package') => void;
  setCustomer: (customerId: string | null) => void;
  clearCart: () => void;
  
  // Computed values (calculated once, cached)
  total: number;
  itemCount: number;
  uniqueItemCount: number;
  isEmpty: boolean;
  subtotal: number;
}

// Helper function to calculate computed values
const calculateComputedValues = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItemCount = items.length;
  const isEmpty = items.length === 0;
  
  return {
    total,
    subtotal: total, // Alias for total (before discounts)
    itemCount,
    uniqueItemCount,
    isEmpty,
  };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => {
      const updateState = (items: CartItem[], customerId?: string | null) => {
        const computed = calculateComputedValues(items);
        return {
          items,
          customerId: customerId !== undefined ? customerId : get().customerId,
          ...computed,
        };
      };

      return {
        items: [],
        customerId: null,
        ...calculateComputedValues([]), // Initial computed values
      
        addItem: (item) => {
          set((state) => {
            
            // Gerar ID único baseado no produto e tipo
            const uniqueId = `${item.id}-${item.type}`;
            const existingItem = state.items.find((i) => 
              i.id === item.id && i.type === item.type
            );
            
            let newItems: CartItem[];
            if (existingItem) {
              // Se o item já existe, apenas atualiza a quantidade
              const newQuantity = Math.min(
                existingItem.quantity + 1,
                existingItem.maxQuantity
              );
              
              
              newItems = state.items.map((i) =>
                i.id === item.id && i.type === item.type
                  ? { ...i, quantity: newQuantity }
                  : i
              );
            } else {
              // Adiciona um novo item ao carrinho com ID único
              const newItem = { 
                ...item, 
                quantity: item.quantity || 1, // CORREÇÃO: Usar quantidade do item
                displayName: item.displayName || `${item.name} ${item.type === 'package' ? `(Pacote ${item.packageUnits || 1}x)` : '(Unidade)'}`
              };
              
              
              newItems = [...state.items, newItem];
            }
            
            return updateState(newItems);
          });
        },
      
        updateItemQuantity: (productId, type, quantity) => {
          set((state) => {
            let newItems: CartItem[];
            
            if (quantity <= 0) {
              newItems = state.items.filter((item) => 
                !(item.id === productId && item.type === type)
              );
            } else {
              newItems = state.items.map((item) =>
                item.id === productId && item.type === type
                  ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                  : item
              );
            }
            
            return updateState(newItems);
          });
        },
      
        removeItem: (productId, type) => {
          set((state) => {
            const newItems = state.items.filter((item) => 
              !(item.id === productId && item.type === type)
            );
            return updateState(newItems);
          });
        },
        
        setCustomer: (customerId) => {
          set((state) => updateState(state.items, customerId));
        },
        
        clearCart: () => {
          set(updateState([], null));
        },
      };
    },
    {
      name: 'cart-storage', // Nome da chave no localStorage
    }
  )
);

// Hooks otimizados usando computed values do store
export const useCartTotal = () => useCart((state) => state.total);

export const useCartItemCount = () => useCart((state) => state.itemCount);

export const useCartSubtotal = () => useCart((state) => state.subtotal);

export const useCartIsEmpty = () => useCart((state) => state.isEmpty);

export const useCartUniqueItemCount = () => useCart((state) => state.uniqueItemCount);

// Selector para estatísticas do carrinho
export const useCartStats = () => useCart((state) => ({
  total: state.total,
  subtotal: state.subtotal,
  itemCount: state.itemCount,
  uniqueItemCount: state.uniqueItemCount,
  isEmpty: state.isEmpty,
}));
