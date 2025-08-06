import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
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
            const existingItem = state.items.find((i) => i.id === item.id);
            
            let newItems: CartItem[];
            if (existingItem) {
              // Se o item já existe, apenas atualiza a quantidade
              const newQuantity = Math.min(
                existingItem.quantity + 1,
                existingItem.maxQuantity
              );
              
              newItems = state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: newQuantity }
                  : i
              );
            } else {
              // Adiciona um novo item ao carrinho
              newItems = [...state.items, { ...item, quantity: 1 }];
            }
            
            return updateState(newItems);
          });
        },
      
        updateItemQuantity: (productId, quantity) => {
          set((state) => {
            let newItems: CartItem[];
            
            if (quantity <= 0) {
              newItems = state.items.filter((item) => item.id !== productId);
            } else {
              newItems = state.items.map((item) =>
                item.id === productId
                  ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                  : item
              );
            }
            
            return updateState(newItems);
          });
        },
      
        removeItem: (productId) => {
          set((state) => {
            const newItems = state.items.filter((item) => item.id !== productId);
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
