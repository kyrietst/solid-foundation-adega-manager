/**
 * Interface de gerenciamento de categorias para administradores
 * Permite criar, editar, ativar/desativar e reordenar categorias
 */

import React, { useState } from 'react';
import {
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  Category,
  CategoryFormData
} from '@/shared/hooks/common/use-categories';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/ui/primitives/button';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import {
  Edit2,
  GripVertical,
  Package,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { CategoryFormModal } from './CategoryFormModal';

export interface CategoryManagementRef {
  openDialog: (category?: Category) => void;
}

export const CategoryManagement = React.forwardRef<CategoryManagementRef>((_, ref) => {
  const { userRole } = useAuth();
  const { data, isLoading } = useAllCategories();
  const categories = (data || []) as Category[];
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsDialogOpen(true);
  };

  React.useImperativeHandle(ref, () => ({
    openDialog: handleOpenDialog
  }));

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = (data: CategoryFormData, isEdit: boolean) => {
    if (isEdit && editingCategory) {
      updateCategory({
        id: editingCategory.id,
        data
      }, {
        onSuccess: () => handleCloseDialog()
      });
    } else {
      createCategory(data, {
        onSuccess: () => handleCloseDialog()
      });
    }
  };

  const handleToggleStatus = (category: Category) => {
    toggleStatus({
      id: category.id,
      isActive: !category.is_active
    });
  };

  // Verificar se é admin
  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center opacity-40">
          <Package className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-zinc-500 text-sm">
            Apenas administradores podem gerenciar categorias.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-full rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Table Section - Aesthetic from Gestão de Clientes */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl m-6 overflow-hidden shadow-2xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4 font-medium w-12 text-center">Ordem</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium text-center">Estoque Mínimo</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Package className="h-12 w-12 mb-4" />
                      <p className="text-zinc-400 font-medium">Nenhuma categoria encontrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category: Category) => (
                  <tr key={category.id} className="group hover:bg-white/[0.03] transition-colors border-b border-white/[0.01]">
                    {/* Position / Handle */}
                    <td className="px-6 py-4 text-center">
                      <GripVertical className="h-4 w-4 text-zinc-600 mx-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    </td>

                    {/* Category Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border border-white/10 shadow-sm shrink-0"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-zinc-500 line-clamp-1">{category.description}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Min Stock */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/30 border border-white/5 text-zinc-400">
                        <AlertTriangle className="h-3 w-3 text-amber-500/60" />
                        <span className="font-mono text-[11px]">
                          {category.default_min_stock_packages ?? 0}cx / {category.default_min_stock_units ?? 0}un
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <SwitchAnimated
                          checked={category.is_active}
                          onCheckedChange={() => handleToggleStatus(category)}
                          disabled={isToggling}
                          variant="yellow"
                          size="sm"
                        />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", category.is_active ? "text-emerald-500" : "text-zinc-600")}>
                          {category.is_active ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                        disabled={isUpdating}
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editingCategory={editingCategory}
        categories={categories}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}));

CategoryManagement.displayName = 'CategoryManagement';

export default CategoryManagement;