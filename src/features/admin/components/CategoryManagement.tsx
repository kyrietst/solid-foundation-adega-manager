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
import { Skeleton } from '@/shared/ui/composite/skeleton';
import {
  Plus,
  Edit2,
  GripVertical,
  Eye,
  EyeOff,
  Package,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { CategoryFormModal } from './CategoryFormModal';

export const CategoryManagement: React.FC = () => {
  const { userRole } = useAuth();
  const { data, isLoading } = useAllCategories();
  const categories = (data || []) as Category[];
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Verificar se é admin
  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-400">
            Apenas administradores podem gerenciar categorias.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsDialogOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Gerenciamento de Categorias
          </h2>
          <p className="text-gray-400 mt-1">
            Gerencie as categorias de produtos do sistema ({categories.length} categorias)
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          disabled={isCreating}
          className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          NOVA CATEGORIA
        </Button>
      </div>

      {/* Lista de categorias */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-gray-400 mb-4">
              Crie a primeira categoria para começar.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              CRIAR CATEGORIA
            </Button>
          </div>
        ) : (
          categories.map((category: Category) => (
            <div
              key={category.id}
              className={cn(
                "bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-4",
                "hover:bg-black/60 transition-all duration-200",
                !category.is_active && "opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Drag handle */}
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />

                  {/* Categoria info */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <div>
                      <h3 className="font-medium text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        {category.description && (
                          <p className="text-sm text-gray-400">
                            {category.description}
                          </p>
                        )}
                        <span className="text-xs text-yellow-400/80 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Mín: {category.default_min_stock_packages ?? 0} cx / {category.default_min_stock_units ?? 0} un
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {category.is_active ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {category.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {/* Toggle status */}
                  <SwitchAnimated
                    checked={category.is_active}
                    onCheckedChange={() => handleToggleStatus(category)}
                    disabled={isToggling}
                    variant="yellow"
                    size="md"
                  />

                  {/* Edit button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(category)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
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
};

export default CategoryManagement;