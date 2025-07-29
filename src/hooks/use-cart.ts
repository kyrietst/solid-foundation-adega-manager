import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CartState = {
  items: CartItem[];
  customerId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (customerId: string | null) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          
          if (existingItem) {
            // Se o item já existe, apenas atualiza a quantidade
            const newQuantity = Math.min(
              existingItem.quantity + 1,
              existingItem.maxQuantity
            );
            
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            };
          }
          
          // Adiciona um novo item ao carrinho
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },
      
      updateItemQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
            };
          }
          
          return {
            items: state.items.map((item) =>
              item.id === productId
                ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                : item
            ),
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      
      setCustomer: (customerId) => {
        set({ customerId });
      },
      
      clearCart: () => {
        set({ items: [], customerId: null });
      },
    }),
    {
      name: 'cart-storage', // Nome da chave no localStorage
    }
  )
);

// Hook para calcular o total do carrinho
export const useCartTotal = () => {
  const items = useCart((state) => state.items);
  
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Hook para contar itens no carrinho
export const useCartItemCount = () => {
  const items = useCart((state) => state.items);
  
  return items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
};
