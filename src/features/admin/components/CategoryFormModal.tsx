
import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import {
    Edit2,
    Save,
    X,
    Package,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { Category, CategoryFormData, validateCategoryName } from '@/shared/hooks/common/use-categories';

interface CategoryFormState extends CategoryFormData {
    id?: string;
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCategory: Category | null; // Can serve as initial data
    categories: Category[]; // For validation
    onSubmit: (data: CategoryFormData, isEdit: boolean) => void;
    isLoading: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    isOpen,
    onClose,
    editingCategory,
    categories,
    onSubmit,
    isLoading
}) => {
    const [formData, setFormData] = useState<CategoryFormState>({
        name: '',
        description: '',
        color: '#6B7280',
        icon: 'Package',
        default_min_stock_packages: 0,
        default_min_stock_units: 0
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (editingCategory) {
                setFormData({
                    id: editingCategory.id,
                    name: editingCategory.name,
                    description: editingCategory.description || '',
                    color: editingCategory.color || '#6B7280',
                    icon: editingCategory.icon || 'Package',
                    default_min_stock_packages: editingCategory.default_min_stock_packages ?? 0,
                    default_min_stock_units: editingCategory.default_min_stock_units ?? 0
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    color: '#6B7280',
                    icon: 'Package',
                    default_min_stock_packages: 0,
                    default_min_stock_units: 0
                });
            }
            setFormErrors({});
        }
    }, [isOpen, editingCategory]);


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

        onSubmit({
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
            color: formData.color,
            icon: formData.icon,
            default_min_stock_packages: formData.default_min_stock_packages ?? 0,
            default_min_stock_units: formData.default_min_stock_units ?? 0
        }, !!editingCategory);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-purple-500/30 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                        <Package className="h-6 w-6 text-purple-400" />
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        {editingCategory
                            ? 'Modifique as informações da categoria selecionada para melhor organização dos produtos.'
                            : 'Crie uma nova categoria para organizar e classificar seus produtos no sistema.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Edit2 className="h-4 w-4 text-purple-400" />
                            Informações Básicas
                        </h3>

                        <div className="space-y-4">
                            {/* Nome */}
                            <div className="space-y-2">
                                <label htmlFor="category-name" className="text-sm font-medium text-gray-300">
                                    Nome da Categoria *
                                </label>
                                <Input
                                    id="category-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Vinhos Tintos, Cervejas, Refrigerantes"
                                    className={cn(
                                        "bg-black/70 border-white/30 text-white placeholder:text-gray-400",
                                        formErrors.name && "border-red-500"
                                    )}
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-red-400">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <label htmlFor="category-description" className="text-sm font-medium text-gray-300">
                                    Descrição
                                </label>
                                <Textarea
                                    id="category-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descrição opcional para categorizar melhor os produtos"
                                    rows={3}
                                    className="bg-black/70 border-white/30 text-white placeholder:text-gray-400 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuração de Estoque */}
                    <div className="bg-black/70 backdrop-blur-xl border border-yellow-500/30 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            Alerta de Estoque
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="category-min-stock-packages" className="text-sm font-medium text-gray-300">
                                        Alerta de Estoque (Pacotes)
                                    </label>
                                    <Input
                                        id="category-min-stock-packages"
                                        type="number"
                                        min="0"
                                        value={formData.default_min_stock_packages ?? 0}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            default_min_stock_packages: e.target.value ? Number(e.target.value) : 0
                                        }))}
                                        placeholder="0"
                                        className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="category-min-stock-units" className="text-sm font-medium text-gray-300">
                                        Alerta de Estoque (Unidades)
                                    </label>
                                    <Input
                                        id="category-min-stock-units"
                                        type="number"
                                        min="0"
                                        value={formData.default_min_stock_units ?? 0}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            default_min_stock_units: e.target.value ? Number(e.target.value) : 0
                                        }))}
                                        placeholder="0"
                                        className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Preview do alerta */}
                            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <div className="flex flex-col gap-1 text-yellow-400 text-sm">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-bold">Regras de Alerta:</span>
                                    </div>
                                    <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-yellow-400/80">
                                        {(formData.default_min_stock_packages ?? 0) > 0 && (
                                            <li>Pacotes: ≤ {formData.default_min_stock_packages}</li>
                                        )}
                                        {(formData.default_min_stock_units ?? 0) > 0 && (
                                            <li>Unidades: ≤ {formData.default_min_stock_units}</li>
                                        )}
                                        {(formData.default_min_stock_packages ?? 0) === 0 && (formData.default_min_stock_units ?? 0) === 0 && (
                                            <li>Nenhum alerta configurado</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aparência Visual */}
                    <div className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-400" />
                            Aparência Visual
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cor */}
                            <div className="space-y-2">
                                <label htmlFor="category-color" className="text-sm font-medium text-gray-300">
                                    Cor da Categoria
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="category-color"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-12 h-12 rounded-lg border-2 border-white/20 bg-transparent cursor-pointer"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        placeholder="#6B7280"
                                        className="flex-1 bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Ícone */}
                            <div className="space-y-2">
                                <label htmlFor="category-icon" className="text-sm font-medium text-gray-300">
                                    Ícone (Lucide React)
                                </label>
                                <Input
                                    id="category-icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="Package"
                                    className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                                />
                                <p className="text-xs text-gray-400">
                                    Nome do ícone do Lucide React (ex: Package, Wine, Beer, Droplets)
                                </p>
                            </div>
                        </div>

                        {/* Preview da categoria */}
                        <div className="mt-4 p-3 bg-black/50 rounded-lg border border-white/10">
                            <p className="text-xs text-gray-400 mb-2">Prévia:</p>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white/20"
                                    style={{ backgroundColor: formData.color }}
                                />
                                <span className="text-white font-medium">
                                    {formData.name || 'Nome da Categoria'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="bg-transparent border-white/30 text-white hover:bg-white/10"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
