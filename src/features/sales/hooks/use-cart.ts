import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/core/api/supabase/client';
import { toastHelpers } from '@/shared/hooks/common/use-toast';
import type {
  CartItemWithVariant,
  VariantSelectionData,
  VariantType
} from '@/core/types/variants.types';

// Type alias para item do carrinho (herda todos os campos de CartItemWithVariant)
type CartItem = CartItemWithVariant;

interface CartState {
  items: CartItem[];
  customerId: string | null;

  // Actions atualizadas para variantes - ALGUMAS AGORA SÃO ASSÍNCRONAS
  addItem: (item: Omit<CartItem, 'displayName'>) => Promise<void>;
  addFromVariantSelection: (selection: VariantSelectionData, product: { id: string; name: string }) => Promise<void>;
  updateItemQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
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

// NOVO: Função para verificar estoque usando Sistema de Dupla Contagem
const checkStockAvailability = async (productId: string, quantity: number = 1, variantType: 'unit' | 'package' = 'unit'): Promise<{ canAdd: boolean; message?: string }> => {
  try {
    // Buscar dados atuais do produto
    const { data: product, error } = await supabase
      .from('products')
      .select('stock_packages, stock_units_loose, has_package_tracking, name')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return {
        canAdd: false,
        message: 'Produto não encontrado ou indisponível.'
      };
    }

    const stockPackages = product.stock_packages || 0;
    const stockUnitsLoose = product.stock_units_loose || 0;
    const hasPackageTracking = product.has_package_tracking;

    // Verificar disponibilidade baseada no tipo de variante
    if (variantType === 'unit') {
      if (stockUnitsLoose < quantity) {
        return {
          canAdd: false,
          message: `Estoque insuficiente. Apenas ${stockUnitsLoose} unidade(s) disponível(eis).`
        };
      }
    } else if (variantType === 'package') {
      if (!hasPackageTracking) {
        return {
          canAdd: false,
          message: 'Este produto não possui rastreamento de pacotes.'
        };
      }
      if (stockPackages < quantity) {
        return {
          canAdd: false,
          message: `Estoque insuficiente. Apenas ${stockPackages} pacote(s) disponível(eis).`
        };
      }
    }

    return { canAdd: true };
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    return {
      canAdd: false,
      message: 'Erro ao verificar disponibilidade do produto.'
    };
  }
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

        addItem: async (item) => {
          console.log('[DEBUG] use-cart - addItem iniciado com:', item);

          // NOVA GUARDA: Verificar estoque antes de adicionar
          const variantType = item.variant_type === 'package' ? 'package' : 'unit';
          const stockCheck = await checkStockAvailability(item.id, item.quantity || 1, variantType);

          console.log('[DEBUG] use-cart - stockCheck resultado:', stockCheck);

          if (!stockCheck.canAdd) {
            console.log('[DEBUG] use-cart - estoque insuficiente, aborting addItem');
            toastHelpers.error('Estoque Insuficiente', stockCheck.message);
            return;
          }

          console.log('[DEBUG] use-cart - estoque OK, procedendo com addItem');

          set((state) => {
            console.log('[DEBUG] use-cart - estado atual do carrinho:', {
              itemsCount: state.items.length,
              items: state.items.map(i => ({ id: i.id, variant_id: i.variant_id, name: i.name }))
            });

            const existingItem = state.items.find((i) =>
              i.id === item.id && i.variant_id === item.variant_id
            );

            console.log('[DEBUG] use-cart - item existente encontrado:', !!existingItem);

            let newItems: CartItem[];
            if (existingItem) {
              // Se o item já existe, apenas atualiza a quantidade
              const newQuantity = Math.min(
                existingItem.quantity + (item.quantity || 1),
                existingItem.maxQuantity
              );

              console.log('[DEBUG] use-cart - atualizando quantidade:', { existingQuantity: existingItem.quantity, newQuantity });

              newItems = state.items.map((i) =>
                i.id === item.id && i.variant_id === item.variant_id
                  ? { ...i, quantity: newQuantity }
                  : i
              );
            } else {
              // Adiciona um novo item ao carrinho
              const displayName = `${item.name} ${
                item.variant_type === 'package'
                  ? `(Pacote ${item.packageUnits || 1}x)`
                  : '(Unidade)'
              }`;

              const newItem: CartItem = {
                ...item,
                quantity: item.quantity || 1,
                displayName
              };

              console.log('[DEBUG] use-cart - adicionando novo item:', newItem);

              newItems = [...state.items, newItem];
            }

            console.log('[DEBUG] use-cart - newItems array:', {
              count: newItems.length,
              items: newItems.map(i => ({ id: i.id, variant_id: i.variant_id, name: i.name }))
            });

            const newState = updateState(newItems);
            console.log('[DEBUG] use-cart - novo estado:', {
              itemsCount: newState.items.length,
              total: newState.total,
              itemCount: newState.itemCount
            });

            return newState;
          });

          console.log('[DEBUG] use-cart - set() executado, mostrando toast de sucesso');

          // Mostrar confirmação de sucesso
          toastHelpers.pos.productAdded(item.name);

          console.log('[DEBUG] use-cart - addItem finalizado com sucesso');
        },

        addFromVariantSelection: async (selection, product) => {
          // NOVA GUARDA: Verificar estoque antes de adicionar seleção de variante
          const stockCheck = await checkStockAvailability(
            product.id,
            selection.quantity,
            selection.variant_type
          );

          if (!stockCheck.canAdd) {
            toastHelpers.error('Estoque Insuficiente', stockCheck.message);
            return;
          }

          set((state) => {
            const existingItem = state.items.find((i) =>
              i.id === product.id && i.variant_id === selection.variant_id
            );

            let newItems: CartItem[];
            if (existingItem) {
              // Atualiza quantidade do item existente
              const newQuantity = existingItem.quantity + selection.quantity;

              newItems = state.items.map((i) =>
                i.id === product.id && i.variant_id === selection.variant_id
                  ? {
                      ...i,
                      quantity: newQuantity,
                      units_sold: i.units_sold + selection.units_sold
                    }
                  : i
              );
            } else {
              // Cria novo item baseado na seleção de variante
              const displayName = `${product.name} ${
                selection.variant_type === 'package'
                  ? `(Pacote ${selection.units_sold / selection.quantity}x)`
                  : '(Unidade)'
              }`;

              const newItem: CartItem = {
                id: product.id,
                variant_id: selection.variant_id,
                name: product.name,
                variant_type: selection.variant_type,
                price: selection.unit_price,
                quantity: selection.quantity,
                maxQuantity: 999, // Será validado no backend
                units_sold: selection.units_sold,
                packageUnits: selection.variant_type === 'package'
                  ? selection.units_sold / selection.quantity
                  : undefined,
                displayName
              };

              newItems = [...state.items, newItem];
            }

            return updateState(newItems);
          });

          // Mostrar confirmação de sucesso
          const typeLabel = selection.variant_type === 'package' ? 'pacote' : 'unidade';
          toastHelpers.pos.productAdded(product.name, typeLabel);
        },
      
        updateItemQuantity: (productId, variantId, quantity) => {
          set((state) => {
            let newItems: CartItem[];
            
            if (quantity <= 0) {
              newItems = state.items.filter((item) => 
                !(item.id === productId && item.variant_id === variantId)
              );
            } else {
              newItems = state.items.map((item) => {
                if (item.id === productId && item.variant_id === variantId) {
                  const newQuantity = Math.min(quantity, item.maxQuantity);
                  // Recalcular units_sold baseado na nova quantidade
                  const unitsPerItem = item.units_sold / item.quantity;
                  
                  return { 
                    ...item, 
                    quantity: newQuantity,
                    units_sold: newQuantity * unitsPerItem
                  };
                }
                return item;
              });
            }
            
            return updateState(newItems);
          });
        },
      
        removeItem: (productId, variantId) => {
          set((state) => {
            const newItems = state.items.filter((item) => 
              !(item.id === productId && item.variant_id === variantId)
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
