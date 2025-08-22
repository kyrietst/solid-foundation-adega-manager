/**
 * Componente de card para exibir informações de um fornecedor
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  CreditCard, 
  DollarSign,
  Package,
  Edit,
  Power,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { useAuth } from '@/app/providers/AuthContext';
import { useToggleSupplierStatus, useDeleteSupplier } from '../hooks/useSuppliers';
import { SupplierForm } from './SupplierForm';
import { cn } from '@/core/config/utils';
import { formatCurrency } from '@/core/config/utils';
import type { Supplier } from '../types';

interface SupplierCardProps {
  supplier: Supplier;
  className?: string;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, className }) => {
  const { userRole } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const toggleStatus = useToggleSupplierStatus();
  const deleteSupplier = useDeleteSupplier();
  
  const handleToggleStatus = () => {
    toggleStatus.mutate({
      id: supplier.id,
      isActive: !supplier.is_active,
    });
  };
  
  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteSupplier.mutate(supplier.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Reset após 3 segundos
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };
  
  const getContactInfo = () => {
    const contacts = [];
    if (supplier.contact_info?.phone) {
      contacts.push({ type: 'phone', value: supplier.contact_info.phone, icon: Phone });
    }
    if (supplier.contact_info?.whatsapp) {
      contacts.push({ type: 'whatsapp', value: supplier.contact_info.whatsapp, icon: MessageCircle });
    }
    if (supplier.contact_info?.email) {
      contacts.push({ type: 'email', value: supplier.contact_info.email, icon: Mail });
    }
    return contacts;
  };
  
  const contacts = getContactInfo();
  
  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-purple-500/10",
        "bg-black/70 backdrop-blur-xl border border-purple-500/30",
        !supplier.is_active && "opacity-60",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30 flex-shrink-0 backdrop-blur-sm">
                <Building2 className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg truncate">
                  {supplier.company_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {supplier.is_active ? (
                    <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-500/10 backdrop-blur-sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-500/10 backdrop-blur-sm">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ações (visível apenas para admin) */}
            {userRole === 'admin' && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-purple-500/20 border border-transparent hover:border-purple-400/30 backdrop-blur-sm transition-all duration-200"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                <SwitchAnimated
                  checked={supplier.is_active}
                  onCheckedChange={handleToggleStatus}
                  disabled={toggleStatus.isPending}
                  size="sm"
                  variant="yellow"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações de contato */}
          {contacts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Contatos</h4>
              <div className="space-y-1">
                {contacts.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <IconComponent className="h-3 w-3" />
                      <span className="truncate">{contact.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Produtos fornecidos */}
          {supplier.products_supplied && supplier.products_supplied.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Package className="h-3 w-3" />
                Produtos
              </h4>
              <div className="flex flex-wrap gap-1">
                {supplier.products_supplied.slice(0, 3).map((product, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30">
                    {product}
                  </Badge>
                ))}
                {supplier.products_supplied.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30">
                    +{supplier.products_supplied.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Informações comerciais */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
            {/* Prazo de entrega */}
            {supplier.delivery_time && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Entrega
                </div>
                <p className="text-sm text-white">{supplier.delivery_time}</p>
              </div>
            )}
            
            {/* Valor mínimo */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <DollarSign className="h-3 w-3" />
                Mín. Pedido
              </div>
              <p className="text-sm text-white">
                {formatCurrency(supplier.minimum_order_value)}
              </p>
            </div>
          </div>
          
          {/* Formas de pagamento */}
          {supplier.payment_methods && supplier.payment_methods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CreditCard className="h-3 w-3" />
                Pagamento
              </div>
              <div className="flex flex-wrap gap-1">
                {supplier.payment_methods.slice(0, 2).map((method, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-black/60 border-gray-400/50 text-gray-200 hover:bg-black/80 hover:border-gray-300/70">
                    {method}
                  </Badge>
                ))}
                {supplier.payment_methods.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-black/60 border-gray-400/50 text-gray-200 hover:bg-black/80 hover:border-gray-300/70">
                    +{supplier.payment_methods.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Observações */}
          {supplier.notes && (
            <div className="space-y-1">
              <h4 className="text-xs text-gray-400">Observações</h4>
              <p className="text-sm text-gray-300 line-clamp-2">{supplier.notes}</p>
            </div>
          )}
          
          {/* Ações de admin no rodapé */}
          {userRole === 'admin' && (
            <div className="flex justify-end pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className={cn(
                  "h-8 px-3 text-xs",
                  showDeleteConfirm 
                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                    : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {showDeleteConfirm ? 'Confirmar' : 'Remover'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de edição */}
      <SupplierForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        supplier={supplier}
      />
    </>
  );
};