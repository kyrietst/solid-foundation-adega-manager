import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/api/supabase/client";
import { PaymentMethod } from "@/features/sales/types";

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: ["payment-methods"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("payment_methods")
                .select("*")
                .eq("is_active", true as any)
                .order("name", { ascending: true });

            if (error) {
                throw new Error(error.message);
            }

            return data as any as PaymentMethod[];
        },
    });
};
