/**
 * Interface de gerenciamento de categorias para administradores
 * Permite criar, editar, ativar/desativar e reordenar categorias
 */

import React, { useState } from 'react';
import { 
  useCategories, 
  useAllCategories,
  useCreateCategory, 
  useUpdateCategory, 
  useToggleCategoryStatus,
  useReorderCategories,
  validateCategoryName,
  Category,
  CategoryFormData
} from '@/shared/hooks/common/use-categories';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/ui/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Skeleton } from '@/shared/ui/composite/skeleton';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff,
  Save,
  X,
  Package
} from 'lucide-react';
import { cn } from '@/core/config/utils';

interface CategoryFormState extends CategoryFormData {
  id?: string;
}

export const CategoryManagement: React.FC = () => {
  const { userRole } = useAuth();
  const { data: categories = [], isLoading } = useAllCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormState | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'Package'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      setEditingCategory({ ...category });
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#6B7280',
        icon: category.icon || 'Package'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#6B7280',
        icon: 'Package'
      });
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#6B7280',
      icon: 'Package'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validar nome
    const nameValidation = validateCategoryName(
      formData.name, 
      categories, 
      editingCategory?.id
    );
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error!;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingCategory) {
      // Editar categoria existente
      updateCategory({
        id: editingCategory.id!,
        data: {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          color: formData.color,
          icon: formData.icon
        }
      }, {
        onSuccess: () => handleCloseDialog()
      });
    } else {
      // Criar nova categoria
      createCategory({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        color: formData.color,
        icon: formData.icon
      }, {
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
          className="gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
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
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Categoria
            </Button>
          </div>
        ) : (
          categories.map((category) => (
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
                      {category.description && (
                        <p className="text-sm text-gray-400">
                          {category.description}
                        </p>
                      )}
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

      {/* Dialog para criar/editar categoria */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory 
                ? 'Modifique as informações da categoria selecionada.' 
                : 'Crie uma nova categoria para organizar seus produtos.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Nome da Categoria *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Vinhos Tintos"
                className={cn(formErrors.name && "border-red-500")}
              />
              {formErrors.name && (
                <p className="text-sm text-red-400">{formErrors.name}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional da categoria"
                rows={3}
              />
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Cor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-white/20 bg-transparent"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#6B7280"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Ícone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Ícone (Lucide React)
              </label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Package"
              />
              <p className="text-xs text-gray-400">
                Nome do ícone do Lucide React (ex: Package, Wine, Beer)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isCreating || isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;