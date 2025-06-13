import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Tipos
type Sale = {
  id: string;
  customer_id: string | null;
  seller_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  status: 'completed' | 'cancelled' | 'returned';
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  items: Array<{
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: {
      name: string;
      barcode?: string;
    };
  }>;
};

type SaleItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
};

type UpsertSaleInput = {
  customer_id: string | null;
  payment_method_id: string;
  total_amount: number;
  items: { 
    product_id: string; 
    quantity: number; 
    unit_price: number 
  }[];
  notes?: string;
};

type PaymentMethod = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

// Hooks
export const useSales = (params?: { 
  startDate?: Date; 
  endDate?: Date;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select(`
          *,
          customer:customers(id, name, email, phone),
          seller:profiles(id, full_name, email),
          items:sale_items(*, product:products(name, barcode))
        `)
        .order("created_at", { ascending: false });

      if (params?.startDate) {
        query = query.gte("created_at", params.startDate.toISOString());
      }
      
      if (params?.endDate) {
        const nextDay = new Date(params.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt("created_at", nextDay.toISOString());
      }
      
      if (params?.status) {
        query = query.eq("status", params.status);
      }
      
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Sale[];
    },
  });
};

export const useUpsertSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleData: UpsertSaleInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase.rpc("create_sale_with_items", {
        p_customer_id: saleData.customer_id,
        p_seller_id: user.id,
        p_payment_method_id: saleData.payment_method_id,
        p_total_amount: saleData.total_amount,
        p_items: saleData.items,
        p_notes: saleData.notes
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Venda registrada com sucesso!",
        description: "A venda foi registrada no sistema.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as PaymentMethod[];
    },
  });
};
