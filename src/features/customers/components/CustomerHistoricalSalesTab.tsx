/**
 * CustomerHistoricalSalesTab.tsx - Tab para Importação de Vendas Históricas v1.0.0
 *
 * @description
 * Interface visual para criar vendas históricas sem afetar estoque.
 * Permite backdating, seleção manual de produtos e preview antes de salvar.
 *
 * @features
 * - Formulário intuitivo para adição de produtos
 * - Seletor de data/hora customizada (backdating)
 * - Cálculo automático de totais
 * - Preview visual da venda antes de salvar
 * - Design System v2.1.0 + Glassmorphism v3.2.0
 * - Validações em tempo real
 * - Feedback visual com toast notifications
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Historical Sales UI
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Badge } from '@/shared/ui/primitives/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { Separator } from '@/shared/ui/primitives/separator';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  Package,
  Plus,
  Save,
  Trash2,
  TruckIcon,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { useAuth } from '@/app/providers/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { Product } from '@/types/inventory.types';
import {
  useCreateHistoricalSale,
  calculateTotalAmount,
  formatSaleDate,
  type HistoricalSaleItem,
} from '../hooks/use-historical-sales';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerHistoricalSalesTabProps {
  customerId: string;
  className?: string;
}

interface SaleItemForm extends HistoricalSaleItem {
  tempId: string; // ID temporário para controle do formulário
  product_name?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão',
  'Débito',
  'Crédito',
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerHistoricalSalesTab: React.FC<CustomerHistoricalSalesTabProps> = ({
  customerId,
  className = '',
}) => {
  // ============================================================================
  // HOOKS E ESTADO
  // ============================================================================

  const { user } = useAuth();

  // Buscar produtos disponíveis
  const { data: products = [] } = useQuery({
    queryKey: ['products', 'available'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { mutate: createHistoricalSale, isPending } = useCreateHistoricalSale();

  // Estado do formulário
  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([]);
  const [saleDate, setSaleDate] = useState('');
  const [saleTime, setSaleTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [notes, setNotes] = useState('');

  // Estado de UI
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [saleType, setSaleType] = useState<'unit' | 'package'>('unit');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalItems = useMemo(() => {
    return calculateTotalAmount(saleItems);
  }, [saleItems]);

  const totalWithDelivery = useMemo(() => {
    return totalItems + parseFloat(deliveryFee || '0');
  }, [totalItems, deliveryFee]);

  const isFormValid = useMemo(() => {
    return (
      saleItems.length > 0 &&
      saleDate &&
      saleTime &&
      paymentMethod &&
      totalItems > 0
    );
  }, [saleItems, saleDate, saleTime, paymentMethod, totalItems]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddProduct = () => {
    if (!selectedProductId || !quantity || !unitPrice) {
      toast.error('Preencha todos os campos do produto');
      return;
    }

    const product = products?.find(p => p.id === selectedProductId);
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }

    const newItem: SaleItemForm = {
      tempId: Date.now().toString(),
      product_id: selectedProductId,
      product_name: product.name,
      quantity: parseInt(quantity),
      unit_price: parseFloat(unitPrice),
      sale_type: saleType,
    };

    setSaleItems([...saleItems, newItem]);

    // Limpar formulário de produto
    setSelectedProductId('');
    setQuantity('1');
    setUnitPrice('');
    setSaleType('unit');

    toast.success(`${product.name} adicionado`);
  };

  const handleRemoveProduct = (tempId: string) => {
    setSaleItems(saleItems.filter(item => item.tempId !== tempId));
    toast.info('Produto removido');
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);

    // Auto-preencher preço
    const product = products?.find(p => p.id === productId);
    if (product) {
      setUnitPrice(product.price.toString());
    }
  };

  const handleSubmit = () => {
    if (!isFormValid || !user) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Combinar data + hora e converter de horário de Brasília (UTC-3) para UTC
    // Usuário digita horário local de Brasília, precisamos converter para UTC
    const localDateTime = new Date(`${saleDate}T${saleTime}:00-03:00`); // -03:00 = Brasília
    const fullDateTime = localDateTime.toISOString();

    createHistoricalSale({
      customer_id: customerId,
      user_id: user.id,
      items: saleItems.map(({ tempId, product_name, ...item }) => item),
      total_amount: totalWithDelivery,
      payment_method: paymentMethod,
      sale_date: fullDateTime,
      notes: notes || undefined,
      delivery: isDelivery,
      delivery_fee: parseFloat(deliveryFee),
    }, {
      onSuccess: () => {
        // Limpar formulário após sucesso
        setSaleItems([]);
        setSaleDate('');
        setSaleTime('');
        setPaymentMethod('');
        setIsDelivery(false);
        setDeliveryFee('0');
        setNotes('');
      },
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header com Aviso */}
      <Card className="bg-accent-orange/10 border-accent-orange/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-accent-orange flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold text-base mb-1">
                ⚠️ Atenção: Venda Histórica
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                Esta função permite importar vendas passadas para o sistema.{' '}
                <strong className="text-accent-orange">O estoque NÃO será afetado</strong>, apenas o histórico
                de compras e métricas do cliente serão atualizados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Dados da Venda */}
        <Card className="bg-black/70 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-blue" />
              Dados da Venda
            </CardTitle>
            <CardDescription className="text-gray-300">
              Informe a data e forma de pagamento da venda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sale-date" className="text-gray-200 font-medium">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data *
                </Label>
                <Input
                  id="sale-date"
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale-time" className="text-gray-200 font-medium">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Hora *
                </Label>
                <Input
                  id="sale-time"
                  type="time"
                  value={saleTime}
                  onChange={(e) => setSaleTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label className="text-gray-200 font-medium">
                <CreditCard className="h-4 w-4 inline mr-1" />
                Forma de Pagamento *
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input
                type="checkbox"
                id="is-delivery"
                checked={isDelivery}
                onChange={(e) => setIsDelivery(e.target.checked)}
                className="w-4 h-4 text-accent-green bg-gray-700 border-gray-600 rounded focus:ring-accent-green"
              />
              <Label htmlFor="is-delivery" className="text-gray-200 font-medium cursor-pointer">
                <TruckIcon className="h-4 w-4 inline mr-1" />
                Venda com Delivery
              </Label>
            </div>

            {/* Taxa de Entrega */}
            {isDelivery && (
              <div className="space-y-2">
                <Label htmlFor="delivery-fee" className="text-gray-200 font-medium">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Taxa de Entrega
                </Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-200 font-medium">
                Observações
              </Label>
              <Input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Ex: Pedido #147 - Importação CSV"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coluna Direita: Produtos */}
        <Card className="bg-black/70 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-accent-green" />
              Adicionar Produtos
            </CardTitle>
            <CardDescription className="text-gray-300">
              Selecione os produtos vendidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Produto */}
            <div className="space-y-2">
              <Label className="text-gray-200 font-medium">
                <Package className="h-4 w-4 inline mr-1" />
                Produto *
              </Label>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
                <SelectTrigger id="product" className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Buscar produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade e Preço */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-200 font-medium">
                  Quantidade *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-price" className="text-gray-200 font-medium">
                  Preço Unit. *
                </Label>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Tipo de Venda */}
            <div className="space-y-2">
              <div className="text-gray-200 font-medium">Tipo de Venda</div>
              <div className="flex gap-3" role="group" aria-label="Tipo de venda">
                <Button
                  type="button"
                  variant={saleType === 'unit' ? 'default' : 'outline'}
                  onClick={() => setSaleType('unit')}
                  className="flex-1"
                  aria-pressed={saleType === 'unit'}
                >
                  Unidade
                </Button>
                <Button
                  type="button"
                  variant={saleType === 'package' ? 'default' : 'outline'}
                  onClick={() => setSaleType('package')}
                  className="flex-1"
                  aria-pressed={saleType === 'package'}
                >
                  Pacote
                </Button>
              </div>
            </div>

            {/* Botão Adicionar */}
            <Button
              onClick={handleAddProduct}
              className="w-full bg-accent-green hover:bg-accent-green/80"
              disabled={!selectedProductId || !quantity || !unitPrice}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos Adicionados */}
      {saleItems.length > 0 && (
        <Card className="bg-black/70 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-accent-purple" />
              Preview da Venda
              <Badge variant="outline" className="ml-2 border-2 border-accent-purple/60 text-accent-purple bg-accent-purple/20">
                {saleItems.length} {saleItems.length === 1 ? 'item' : 'itens'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {saleItems.map((item) => (
                <div
                  key={item.tempId}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-300">
                      {item.quantity}x {formatCurrency(item.unit_price)} ({item.sale_type === 'package' ? 'Pacote' : 'Unidade'})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-green font-bold">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProduct(item.tempId)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator className="bg-white/20" />

              {/* Totalizadores */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-gray-200">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(totalItems)}</span>
                </div>
                {isDelivery && parseFloat(deliveryFee) > 0 && (
                  <div className="flex justify-between text-gray-200">
                    <span>Taxa de Entrega:</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(deliveryFee))}</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-accent-green">{formatCurrency(totalWithDelivery)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Salvar */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20">
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isPending}
            className="w-full bg-accent-blue hover:bg-accent-blue/80 h-12 text-base font-semibold"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Venda Histórica
              </>
            )}
          </Button>

          {!isFormValid && saleItems.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-3 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Adicione pelo menos 1 produto para continuar
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default CustomerHistoricalSalesTab;
