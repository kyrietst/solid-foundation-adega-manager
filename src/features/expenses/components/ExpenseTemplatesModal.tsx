import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Switch } from '@/shared/ui/primitives/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  useExpenseTemplates, 
  useCreateExpenseTemplate, 
  useUpdateExpenseTemplate, 
  useToggleExpenseTemplate,
  ExpenseTemplateWithCategory
} from '../hooks/useExpenses';
import { useExpenseCategories } from '../hooks/useExpenseCategories';
import { Loader2, Plus, Pencil, Power, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';

const templateSchema = z.object({
  description: z.string().min(3, "Descrição muito curta"),
  amount: z.string().transform((val) => Number(val.replace(/[^0-9,.]/g, '').replace(',', '.'))),
  category_id: z.string().min(1, "Selecione uma categoria"), // Changed from uuid to min(1) to be safer if IDs are not uuids
  day_of_month: z.number().min(1).max(31),
  active: z.boolean().default(true)
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface ExpenseTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseTemplatesModal: React.FC<ExpenseTemplatesModalProps> = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: templates, isLoading } = useExpenseTemplates();
  const { data: categories } = useExpenseCategories();
  
  const createTemplate = useCreateExpenseTemplate();
  const updateTemplate = useUpdateExpenseTemplate();
  const toggleTemplate = useToggleExpenseTemplate();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      description: '',
      amount: 0,
      active: true,
      day_of_month: 5
    }
  });

  const onSubmit = (data: TemplateFormValues) => {
    if (isEditing && editingId) {
      updateTemplate.mutate({ id: editingId, updates: data }, {
        onSuccess: () => {
          setIsEditing(false);
          setEditingId(null);
          form.reset();
        }
      });
    } else {
      createTemplate.mutate(data, {
        onSuccess: () => {
          form.reset();
        }
      });
    }
  };

  const handleEdit = (template: ExpenseTemplateWithCategory) => {
    form.setValue('description', template.description);
    form.setValue('amount', template.amount as any);
    form.setValue('category_id', template.category_id || '');
    form.setValue('day_of_month', template.day_of_month);
    form.setValue('active', template.active);
    
    setEditingId(template.id);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    form.reset();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarClock className="w-6 h-6 text-emerald-500" />
            Gerenciar Despesas Fixas
          </DialogTitle>
          <DialogDescription>
            Configure despesas que se repetem todo mês (Ex: Aluguel, Internet).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4 flex-1 overflow-hidden">
          {/* LEFT: LIST OF TEMPLATES */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="p-3 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-400">Modelos Ativos ({templates?.filter(t => t.active).length || 0})</span>
              {isEditing && (
                 <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <Plus className="w-4 h-4 mr-1"/> Novo
                 </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : templates?.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Nenhuma despesa fixa cadastrada.
                  </div>
                ) : (
                  templates?.map(template => (
                    <div 
                      key={template.id} 
                      className={cn(
                        "p-3 rounded-md border text-sm flex items-center justify-between group transition-all",
                        template.active ? "bg-slate-800/40 border-slate-700" : "bg-slate-900/20 border-slate-800 opacity-60",
                        editingId === template.id ? "ring-2 ring-emerald-500/50 border-emerald-500/50 bg-emerald-950/20" : "hover:border-slate-600"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-semibold text-white">{template.description}</span>
                           <Badge variant="outline" className="text-[10px] h-5 bg-slate-950/50 border-slate-800">
                              Dia {template.day_of_month}
                           </Badge>
                           {!template.active && <Badge variant="secondary" className="text-[10px] h-5">Pausado</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: template.expense_categories?.color || '#555' }}
                            />
                            {template.expense_categories?.name || 'Sem Categoria'}
                            <span className="text-slate-600">|</span>
                            <span className="text-emerald-400 font-medium">{formatCurrency(template.amount)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 hover:bg-slate-700 hover:text-white"
                            onClick={() => handleEdit(template)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                         </Button>
                         <Button 
                            size="icon" 
                            variant="ghost" 
                            className={cn("h-8 w-8 hover:bg-slate-700", template.active ? "text-emerald-500 hover:text-red-400" : "text-slate-500 hover:text-emerald-400")}
                            onClick={() => toggleTemplate.mutate({ id: template.id, active: !template.active })}
                          >
                            <Power className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: FORM */}
          <div className="w-full md:w-[320px] bg-slate-900/80 p-5 rounded-lg border border-slate-800 h-fit">
             <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                {isEditing ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                {isEditing ? "Editar Modelo" : "Nova Despesa Fixa"}
             </h3>

             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                   <Label>Descrição</Label>
                   <Input {...form.register('description')} placeholder="Ex: Aluguel da Loja" className="bg-slate-950 border-slate-800 text-white" />
                   {form.formState.errors.description && <span className="text-xs text-red-400">{form.formState.errors.description.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <Label>Valor (R$)</Label>
                      <Input {...form.register('amount')} type="number" step="0.01" className="bg-slate-950 border-slate-800 text-white" />
                   </div>
                   <div className="space-y-1.5">
                      <Label>Dia Venc.</Label>
                      <Input {...form.register('day_of_month', { valueAsNumber: true })} type="number" min="1" max="31" className="bg-slate-950 border-slate-800 text-white" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <Label>Categoria</Label>
                   <Select 
                      onValueChange={(val) => form.setValue('category_id', val)} 
                      value={form.watch('category_id')}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                         <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                         {categories?.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                   {form.formState.errors.category_id && <span className="text-xs text-red-400">{form.formState.errors.category_id.message}</span>}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                   {isEditing && (
                      <Button type="button" variant="ghost" onClick={handleCancelEdit} className="text-slate-400 hover:text-white">
                         Cancelar
                      </Button>
                   )}
                   <Button 
                      type="submit" 
                      className={cn("w-full md:w-auto", isEditing ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700")}
                      disabled={createTemplate.isPending || updateTemplate.isPending}
                    >
                      {(createTemplate.isPending || updateTemplate.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                   </Button>
                </div>
             </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
