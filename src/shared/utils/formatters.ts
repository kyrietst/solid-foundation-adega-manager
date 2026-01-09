import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatCurrency = (value: number | undefined | null): string => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value || 0));
};

import { convertToSaoPaulo } from "./timezone-saopaulo";

export const formatDate = (date: string | Date | null | undefined, formatStr: string = "dd/MM/yyyy 'às' HH:mm"): string => {
    if (!date) return "";
    const spDate = convertToSaoPaulo(date);
    return format(spDate, formatStr, { locale: ptBR });
};
