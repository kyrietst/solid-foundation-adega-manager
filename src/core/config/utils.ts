import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

// Address formatting utility
export interface AddressData {
  raw?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function formatAddress(address: any): string {
  if (!address) return '';

  // If it's already a string, return it
  if (typeof address === 'string') return address;

  // If it's an object (JSONB), format it properly
  if (typeof address === 'object') {
    // Check for FiscalAddress structure (New Standard)
    if ('logradouro' in address || 'nome_municipio' in address) {
        const parts = [
            [address.logradouro, address.numero || 'S/N'].filter(Boolean).join(', '),
            address.bairro,
            [address.nome_municipio, address.uf].filter(Boolean).join(' - ')
        ];
        return parts.filter(Boolean).join(' - ');
    }

    const addr = address as AddressData;

    // Prefer raw if available, otherwise construct from parts
    if (addr.raw) return addr.raw;

    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.country
    ].filter(Boolean);

    return parts.join(', ') || '';
  }

  return '';
}
