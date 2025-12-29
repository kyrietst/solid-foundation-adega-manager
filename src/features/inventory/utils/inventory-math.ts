/**
 * Utilitários matemáticos para o gerenciamento de inventário.
 * Foca em cálculos fiscais e de margem com segurança numérica.
 */

// Função para calcular margens de forma segura, evitando overflow numérico
export const safeCalculateMargin = (
    salePrice: number | undefined | null,
    costPrice: number | undefined | null,
    maxMargin: number = 999
): number | null => {
    // Validar inputs de forma robusta
    const validSalePrice = typeof salePrice === 'number' && salePrice > 0 ? salePrice : null;
    const validCostPrice = typeof costPrice === 'number' && costPrice > 0 ? costPrice : null;

    if (!validSalePrice || !validCostPrice) {
        return null;
    }

    const margin = ((validSalePrice - validCostPrice) / validCostPrice) * 100;

    // Limitar margem ao máximo permitido pelo banco e garantir resultado válido
    return Number.isFinite(margin) ? Math.min(Math.max(margin, 0), maxMargin) : null;
};

// Função para calcular margem de pacote de forma segura
export const safeCalculatePackageMargin = (
    packagePrice: number | undefined | null,
    costPrice: number | undefined | null,
    packageUnits: number | undefined | null,
    maxMargin: number = 999
): number | null => {
    // Validar inputs de forma robusta
    const validPackagePrice = typeof packagePrice === 'number' && packagePrice > 0 ? packagePrice : null;
    const validCostPrice = typeof costPrice === 'number' && costPrice > 0 ? costPrice : null;
    const validPackageUnits = typeof packageUnits === 'number' && packageUnits > 0 ? packageUnits : null;

    if (!validPackagePrice || !validCostPrice || !validPackageUnits) {
        return null;
    }

    const totalCost = validCostPrice * validPackageUnits;
    const margin = ((validPackagePrice - totalCost) / totalCost) * 100;

    // Limitar margem ao máximo permitido pelo banco e garantir resultado válido
    return Number.isFinite(margin) ? Math.min(Math.max(margin, 0), maxMargin) : null;
};
