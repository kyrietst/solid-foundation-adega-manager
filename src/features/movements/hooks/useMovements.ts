/**
 * Hook para buscar dados de movimentações
 * Centraliza todas as queries relacionadas a movimentações
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { InventoryMovement } from '@/types/inventory.types';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
}

export interface Sale {
  id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
}

// Mock data para teste de layout - conjunto completo
const mockMovements: InventoryMovement[] = [
  {
    id: '1',
    product_id: 'prod_1',
    type: 'IN',
    quantity: 50,
    reason: 'Reabastecimento',
    date: '2025-08-15T10:30:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Recebimento de novo lote de Cabernet Sauvignon',
    unit_cost: 25.50,
    created_at: '2025-08-15T10:30:00Z',
    updated_at: '2025-08-15T10:30:00Z'
  },
  {
    id: '2',
    product_id: 'prod_2',
    type: 'OUT',
    quantity: 10,
    reason: 'Venda',
    date: '2025-08-15T09:15:00Z',
    user_id: 'user_2',
    reference_sale_id: 'sale_123',
    notes: 'Venda para cliente premium - Maria Santos',
    unit_cost: 42.50,
    created_at: '2025-08-15T09:15:00Z',
    updated_at: '2025-08-15T09:15:00Z'
  },
  {
    id: '3',
    product_id: 'prod_3',
    type: 'FIADO',
    quantity: 5,
    reason: 'Crédito cliente',
    date: '2025-08-14T16:45:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Cliente João Silva - fiado autorizado pelo gerente',
    unit_cost: 38.00,
    created_at: '2025-08-14T16:45:00Z',
    updated_at: '2025-08-14T16:45:00Z'
  },
  {
    id: '4',
    product_id: 'prod_1',
    type: 'DEVOLUCAO',
    quantity: 3,
    reason: 'Produto defeituoso',
    date: '2025-08-14T14:20:00Z',
    user_id: 'user_2',
    reference_sale_id: 'sale_120',
    notes: 'Garrafa com problema na rolha - reembolso total',
    unit_cost: 25.50,
    created_at: '2025-08-14T14:20:00Z',
    updated_at: '2025-08-14T14:20:00Z'
  },
  {
    id: '5',
    product_id: 'prod_4',
    type: 'IN',
    quantity: 100,
    reason: 'Compra fornecedor',
    date: '2025-08-13T08:00:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Lote especial safra 2020 - edição limitada',
    unit_cost: 85.00,
    created_at: '2025-08-13T08:00:00Z',
    updated_at: '2025-08-13T08:00:00Z'
  },
  {
    id: '6',
    product_id: 'prod_5',
    type: 'OUT',
    quantity: 25,
    reason: 'Venda atacado',
    date: '2025-08-12T15:30:00Z',
    user_id: 'user_3',
    reference_sale_id: 'sale_119',
    notes: 'Venda em atacado para restaurante Bella Vista',
    unit_cost: 28.00,
    created_at: '2025-08-12T15:30:00Z',
    updated_at: '2025-08-12T15:30:00Z'
  },
  {
    id: '7',
    product_id: 'prod_6',
    type: 'IN',
    quantity: 75,
    reason: 'Transferência',
    date: '2025-08-12T11:00:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Transferência da filial centro para estoque principal',
    unit_cost: 55.75,
    created_at: '2025-08-12T11:00:00Z',
    updated_at: '2025-08-12T11:00:00Z'
  },
  {
    id: '8',
    product_id: 'prod_7',
    type: 'FIADO',
    quantity: 8,
    reason: 'Cliente fidelidade',
    date: '2025-08-11T18:45:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Cliente Pedro Oliveira - programa fidelidade gold',
    unit_cost: 95.00,
    created_at: '2025-08-11T18:45:00Z',
    updated_at: '2025-08-11T18:45:00Z'
  },
  {
    id: '9',
    product_id: 'prod_2',
    type: 'DEVOLUCAO',
    quantity: 2,
    reason: 'Erro pedido',
    date: '2025-08-11T13:15:00Z',
    user_id: 'user_3',
    reference_sale_id: 'sale_115',
    notes: 'Cliente pediu tinto mas recebeu branco - troca autorizada',
    unit_cost: 42.50,
    created_at: '2025-08-11T13:15:00Z',
    updated_at: '2025-08-11T13:15:00Z'
  },
  {
    id: '10',
    product_id: 'prod_8',
    type: 'OUT',
    quantity: 12,
    reason: 'Evento corporativo',
    date: '2025-08-10T16:20:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_112',
    notes: 'Evento empresa Tech Solutions - desconto corporativo aplicado',
    unit_cost: 120.00,
    created_at: '2025-08-10T16:20:00Z',
    updated_at: '2025-08-10T16:20:00Z'
  },
  {
    id: '11',
    product_id: 'prod_9',
    type: 'IN',
    quantity: 200,
    reason: 'Importação',
    date: '2025-08-10T09:00:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Importação direta da França - lote premium Bordeaux',
    unit_cost: 180.00,
    created_at: '2025-08-10T09:00:00Z',
    updated_at: '2025-08-10T09:00:00Z'
  },
  {
    id: '12',
    product_id: 'prod_3',
    type: 'OUT',
    quantity: 6,
    reason: 'Degustação',
    date: '2025-08-09T14:30:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Evento degustação para clientes VIP - amostra grátis',
    unit_cost: 38.00,
    created_at: '2025-08-09T14:30:00Z',
    updated_at: '2025-08-09T14:30:00Z'
  },
  {
    id: '13',
    product_id: 'prod_10',
    type: 'FIADO',
    quantity: 15,
    reason: 'Parceria comercial',
    date: '2025-08-08T17:00:00Z',
    user_id: 'user_3',
    reference_sale_id: null,
    notes: 'Hotel Luxo Palace - parceria comercial mensal',
    unit_cost: 75.50,
    created_at: '2025-08-08T17:00:00Z',
    updated_at: '2025-08-08T17:00:00Z'
  },
  {
    id: '14',
    product_id: 'prod_4',
    type: 'OUT',
    quantity: 4,
    reason: 'Presente corporativo',
    date: '2025-08-08T12:45:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_108',
    notes: 'Presente para diretor empresa parceira - embalagem especial',
    unit_cost: 120.00,
    created_at: '2025-08-08T12:45:00Z',
    updated_at: '2025-08-08T12:45:00Z'
  },
  {
    id: '15',
    product_id: 'prod_11',
    type: 'IN',
    quantity: 60,
    reason: 'Reposição sazonal',
    date: '2025-08-07T10:15:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Reposição para temporada de inverno - vinhos encorpados',
    unit_cost: 65.25,
    created_at: '2025-08-07T10:15:00Z',
    updated_at: '2025-08-07T10:15:00Z'
  },
  {
    id: '16',
    product_id: 'prod_12',
    type: 'OUT',
    quantity: 18,
    reason: 'Casamento premium',
    date: '2025-08-06T19:30:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_105',
    notes: 'Evento de casamento - seleção especial para brinde dos noivos',
    unit_cost: 150.00,
    created_at: '2025-08-06T19:30:00Z',
    updated_at: '2025-08-06T19:30:00Z'
  },
  {
    id: '17',
    product_id: 'prod_6',
    type: 'FIADO',
    quantity: 12,
    reason: 'Cliente corporativo',
    date: '2025-08-06T14:45:00Z',
    user_id: 'user_3',
    reference_sale_id: null,
    notes: 'Escritório de advocacia Martins & Associados - conta mensal',
    unit_cost: 55.75,
    created_at: '2025-08-06T14:45:00Z',
    updated_at: '2025-08-06T14:45:00Z'
  },
  {
    id: '18',
    product_id: 'prod_13',
    type: 'IN',
    quantity: 45,
    reason: 'Liquidação fornecedor',
    date: '2025-08-05T16:20:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Oportunidade única - fornecedor encerrando linha de produtos',
    unit_cost: 22.80,
    created_at: '2025-08-05T16:20:00Z',
    updated_at: '2025-08-05T16:20:00Z'
  },
  {
    id: '19',
    product_id: 'prod_7',
    type: 'DEVOLUCAO',
    quantity: 1,
    reason: 'Avaria transporte',
    date: '2025-08-05T11:30:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_102',
    notes: 'Garrafa quebrada durante entrega - seguro cobrirá reposição',
    unit_cost: 95.00,
    created_at: '2025-08-05T11:30:00Z',
    updated_at: '2025-08-05T11:30:00Z'
  },
  {
    id: '20',
    product_id: 'prod_14',
    type: 'OUT',
    quantity: 30,
    reason: 'Feira gastronômica',
    date: '2025-08-04T13:15:00Z',
    user_id: 'user_3',
    reference_sale_id: 'sale_100',
    notes: 'Participação em feira gastronômica - stand promocional da adega',
    unit_cost: 48.90,
    created_at: '2025-08-04T13:15:00Z',
    updated_at: '2025-08-04T13:15:00Z'
  },
  {
    id: '21',
    product_id: 'prod_15',
    type: 'IN',
    quantity: 80,
    reason: 'Estoque temporada',
    date: '2025-08-03T09:30:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Preparação para alta temporada de verão',
    unit_cost: 32.50,
    created_at: '2025-08-03T09:30:00Z',
    updated_at: '2025-08-03T09:30:00Z'
  },
  {
    id: '22',
    product_id: 'prod_8',
    type: 'FIADO',
    quantity: 20,
    reason: 'Evento social',
    date: '2025-08-02T20:15:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Clube Social Elite - evento de fim de semana',
    unit_cost: 120.00,
    created_at: '2025-08-02T20:15:00Z',
    updated_at: '2025-08-02T20:15:00Z'
  },
  {
    id: '23',
    product_id: 'prod_11',
    type: 'OUT',
    quantity: 15,
    reason: 'Venda online',
    date: '2025-08-02T16:45:00Z',
    user_id: 'user_3',
    reference_sale_id: 'sale_095',
    notes: 'Pedido e-commerce - entrega expressa solicitada',
    unit_cost: 65.25,
    created_at: '2025-08-02T16:45:00Z',
    updated_at: '2025-08-02T16:45:00Z'
  },
  {
    id: '24',
    product_id: 'prod_6',
    type: 'DEVOLUCAO',
    quantity: 4,
    reason: 'Data vencimento',
    date: '2025-08-01T14:30:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_090',
    notes: 'Produto próximo ao vencimento - política de troca',
    unit_cost: 55.75,
    created_at: '2025-08-01T14:30:00Z',
    updated_at: '2025-08-01T14:30:00Z'
  },
  {
    id: '25',
    product_id: 'prod_16',
    type: 'IN',
    quantity: 35,
    reason: 'Promo fornecedor',
    date: '2025-07-31T11:00:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Promoção especial fornecedor - desconto 25%',
    unit_cost: 18.75,
    created_at: '2025-07-31T11:00:00Z',
    updated_at: '2025-07-31T11:00:00Z'
  },
  {
    id: '26',
    product_id: 'prod_9',
    type: 'OUT',
    quantity: 8,
    reason: 'Presente executivo',
    date: '2025-07-30T17:20:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_085',
    notes: 'Kit presente para CEO empresa parceira',
    unit_cost: 180.00,
    created_at: '2025-07-30T17:20:00Z',
    updated_at: '2025-07-30T17:20:00Z'
  },
  {
    id: '27',
    product_id: 'prod_17',
    type: 'FIADO',
    quantity: 25,
    reason: 'Conta corporativa',
    date: '2025-07-29T13:45:00Z',
    user_id: 'user_3',
    reference_sale_id: null,
    notes: 'Empresa Nacional Seguros - conta mensal autorizada',
    unit_cost: 42.00,
    created_at: '2025-07-29T13:45:00Z',
    updated_at: '2025-07-29T13:45:00Z'
  },
  {
    id: '28',
    product_id: 'prod_3',
    type: 'OUT',
    quantity: 12,
    reason: 'Aniversário VIP',
    date: '2025-07-28T19:30:00Z',
    user_id: 'user_2',
    reference_sale_id: 'sale_080',
    notes: 'Festa de aniversário cliente premium - seleção especial',
    unit_cost: 38.00,
    created_at: '2025-07-28T19:30:00Z',
    updated_at: '2025-07-28T19:30:00Z'
  },
  {
    id: '29',
    product_id: 'prod_18',
    type: 'IN',
    quantity: 90,
    reason: 'Expansão catálogo',
    date: '2025-07-27T10:15:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Nova linha de produtos premium para expansão',
    unit_cost: 78.90,
    created_at: '2025-07-27T10:15:00Z',
    updated_at: '2025-07-27T10:15:00Z'
  },
  {
    id: '30',
    product_id: 'prod_12',
    type: 'DEVOLUCAO',
    quantity: 2,
    reason: 'Qualidade inferior',
    date: '2025-07-26T15:00:00Z',
    user_id: 'user_3',
    reference_sale_id: 'sale_075',
    notes: 'Cliente relatou qualidade abaixo do esperado',
    unit_cost: 150.00,
    created_at: '2025-07-26T15:00:00Z',
    updated_at: '2025-07-26T15:00:00Z'
  },
  {
    id: '31',
    product_id: 'prod_19',
    type: 'OUT',
    quantity: 40,
    reason: 'Distribuidor regional',
    date: '2025-07-25T12:30:00Z',
    user_id: 'user_2',
    reference_sale_id: 'sale_070',
    notes: 'Venda para distribuidor região sul - atacado',
    unit_cost: 25.80,
    created_at: '2025-07-25T12:30:00Z',
    updated_at: '2025-07-25T12:30:00Z'
  },
  {
    id: '32',
    product_id: 'prod_20',
    type: 'IN',
    quantity: 65,
    reason: 'Safra especial',
    date: '2025-07-24T08:45:00Z',
    user_id: 'user_1',
    reference_sale_id: null,
    notes: 'Safra limitada 2023 - apenas 500 garrafas produzidas',
    unit_cost: 220.00,
    created_at: '2025-07-24T08:45:00Z',
    updated_at: '2025-07-24T08:45:00Z'
  },
  {
    id: '33',
    product_id: 'prod_7',
    type: 'FIADO',
    quantity: 6,
    reason: 'Cliente especial',
    date: '2025-07-23T18:20:00Z',
    user_id: 'user_3',
    reference_sale_id: null,
    notes: 'Cliente Roberto Silva - histórico impecável de pagamentos',
    unit_cost: 95.00,
    created_at: '2025-07-23T18:20:00Z',
    updated_at: '2025-07-23T18:20:00Z'
  },
  {
    id: '34',
    product_id: 'prod_14',
    type: 'OUT',
    quantity: 22,
    reason: 'Restaurante parceiro',
    date: '2025-07-22T14:10:00Z',
    user_id: 'user_1',
    reference_sale_id: 'sale_065',
    notes: 'Restaurante Três Estrelas - pedido semanal regular',
    unit_cost: 48.90,
    created_at: '2025-07-22T14:10:00Z',
    updated_at: '2025-07-22T14:10:00Z'
  },
  {
    id: '35',
    product_id: 'prod_21',
    type: 'IN',
    quantity: 55,
    reason: 'Reposição urgente',
    date: '2025-07-21T16:30:00Z',
    user_id: 'user_2',
    reference_sale_id: null,
    notes: 'Produto em alta demanda - reposição emergencial',
    unit_cost: 52.40,
    created_at: '2025-07-21T16:30:00Z',
    updated_at: '2025-07-21T16:30:00Z'
  }
];

export const useMovements = () => {
  // Query principal - movimentações (dados reais ativados)
  const {
    data: movements = [],
    isLoading: isLoadingMovements,
    error: movementsError
  } = useQuery({
    queryKey: ['inventory_movements'],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return {
    movements,
    isLoadingMovements,
    movementsError,
  };
};

// Mock data para produtos - catálogo completo expandido
const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Vinho Tinto Cabernet Sauvignon Nacional', price: 35.90 },
  { id: 'prod_2', name: 'Vinho Branco Chardonnay Reserva', price: 42.50 },
  { id: 'prod_3', name: 'Vinho Rosé Pinot Noir Premium', price: 38.00 },
  { id: 'prod_4', name: 'Champagne Especial Safra 2020', price: 120.00 },
  { id: 'prod_5', name: 'Vinho Tinto Merlot Clássico', price: 28.00 },
  { id: 'prod_6', name: 'Vinho Branco Sauvignon Blanc', price: 55.75 },
  { id: 'prod_7', name: 'Vinho Tinto Malbec Argentino', price: 95.00 },
  { id: 'prod_8', name: 'Espumante Brut Especial', price: 120.00 },
  { id: 'prod_9', name: 'Vinho Tinto Bordeaux França', price: 180.00 },
  { id: 'prod_10', name: 'Vinho Branco Riesling Alemão', price: 75.50 },
  { id: 'prod_11', name: 'Vinho Tinto Tempranillo Reserva', price: 65.25 },
  { id: 'prod_12', name: 'Champagne Dom Pérignon Vintage', price: 150.00 },
  { id: 'prod_13', name: 'Vinho Tinto Sangiovese Italiano', price: 22.80 },
  { id: 'prod_14', name: 'Vinho Verde Português', price: 48.90 },
  { id: 'prod_15', name: 'Vinho Tinto Carmenère Chileno', price: 32.50 },
  { id: 'prod_16', name: 'Vinho Branco Moscato d\'Asti', price: 18.75 },
  { id: 'prod_17', name: 'Vinho Tinto Shiraz Australiano', price: 42.00 },
  { id: 'prod_18', name: 'Vinho Tinto Barolo Italiano Premium', price: 78.90 },
  { id: 'prod_19', name: 'Vinho Branco Albariño Espanhol', price: 25.80 },
  { id: 'prod_20', name: 'Vinho Tinto Amarone Safra Limitada', price: 220.00 },
  { id: 'prod_21', name: 'Vinho Rosé Provence França', price: 52.40 }
];

// Mock data para clientes expandido
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'João Silva' },
  { id: 'cust_2', name: 'Maria Santos' },
  { id: 'cust_3', name: 'Pedro Oliveira' },
  { id: 'cust_4', name: 'Restaurante Bella Vista' },
  { id: 'cust_5', name: 'Tech Solutions Ltda' },
  { id: 'cust_6', name: 'Hotel Luxo Palace' },
  { id: 'cust_7', name: 'Casal Fernandes' },
  { id: 'cust_8', name: 'Martins & Associados Advocacia' },
  { id: 'cust_9', name: 'Clube Social Elite' },
  { id: 'cust_10', name: 'Empresa Nacional Seguros' },
  { id: 'cust_11', name: 'Roberto Silva' },
  { id: 'cust_12', name: 'Restaurante Três Estrelas' },
  { id: 'cust_13', name: 'Distribuidora Sul Vinhos' }
];

// Mock data para vendas expandido
const mockSales: Sale[] = [
  { id: 'sale_065', created_at: '2025-07-22T14:00:00Z' },
  { id: 'sale_070', created_at: '2025-07-25T12:00:00Z' },
  { id: 'sale_075', created_at: '2025-07-26T14:30:00Z' },
  { id: 'sale_080', created_at: '2025-07-28T19:00:00Z' },
  { id: 'sale_085', created_at: '2025-07-30T17:00:00Z' },
  { id: 'sale_090', created_at: '2025-08-01T14:00:00Z' },
  { id: 'sale_095', created_at: '2025-08-02T16:30:00Z' },
  { id: 'sale_100', created_at: '2025-08-04T13:00:00Z' },
  { id: 'sale_102', created_at: '2025-08-05T11:00:00Z' },
  { id: 'sale_105', created_at: '2025-08-06T19:00:00Z' },
  { id: 'sale_108', created_at: '2025-08-08T12:30:00Z' },
  { id: 'sale_112', created_at: '2025-08-10T16:00:00Z' },
  { id: 'sale_115', created_at: '2025-08-11T13:00:00Z' },
  { id: 'sale_119', created_at: '2025-08-12T15:00:00Z' },
  { id: 'sale_120', created_at: '2025-08-14T14:00:00Z' },
  { id: 'sale_123', created_at: '2025-08-15T09:00:00Z' }
];

// Mock data para usuários
const mockUsers: UserProfile[] = [
  { id: 'user_1', name: 'Admin Principal' },
  { id: 'user_2', name: 'Funcionário José' },
  { id: 'user_3', name: 'Supervisora Ana' }
];

export const useMovementSupportData = () => {
  // Queries ativadas para dados reais do Supabase
  // Query para produtos
  const {
    data: products = [],
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['products', 'movement'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Query para clientes
  const {
    data: customers = [],
    isLoading: isLoadingCustomers
  } = useQuery({
    queryKey: ['customers', 'minimal'],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from('customers')
        .select('id,name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Query para vendas (para devolução/fiado)
  const {
    data: salesList = [],
    isLoading: isLoadingSales
  } = useQuery({
    queryKey: ['sales', 'minimal'],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('id,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Query para usuários (para exibir responsável)
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['users', 'minimal'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,name');
      if (error) throw error;
      return data;
    }
  });

  return {
    products,
    customers,
    salesList,
    users,
    isLoadingProducts,
    isLoadingCustomers,
    isLoadingSales,
    isLoadingUsers,
    isLoading: isLoadingProducts || isLoadingCustomers || isLoadingSales || isLoadingUsers
  };
};