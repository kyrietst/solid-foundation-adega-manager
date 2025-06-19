import React, { useState, useMemo, useEffect } from 'react';

type Product = { id: string; name: string; price: number };
 type UserProfile = { id: string; name: string };
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCcw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Movements: React.FC = () => {
  const { userRole, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'out',
    product_id: '',
    quantity: '',
    reason: '',
    customer_id: '',
    amount: '',
    due_date: '',
    sale_id: ''
  });

  // Carrega produtos (para dropdown e mapeamento)
  const { data: products = [] } = useQuery({
    queryKey: ['products', 'movement'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('id,name,price').order('name');
      if (error) throw error;
      return data as Product[];
    }
  });

  // Carrega clientes (para dropdown fiado)
  const { data: customers = [] } = useQuery({
    queryKey: ['customers','minimal'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id,name').order('name');
      if(error) throw error;
      return data as {id:string;name:string}[];
    }
  });

  // Carrega vendas (para devolução / fiado)
  const { data: salesList = [] } = useQuery({
    queryKey: ['sales','minimal'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales').select('id,created_at').order('created_at',{ascending:false}).limit(100);
      if(error) throw error;
      return data as {id:string;created_at:string}[];
    }
  });

  // Carrega usuários (para exibir responsável)
  const { data: users = [] } = useQuery({
    queryKey: ['users', 'minimal'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id,name');
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  const productsMap = useMemo(() => Object.fromEntries(products.map(p => [p.id, { name: p.name, price: p.price }])), [products]);
  const usersMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users]);

  const typeInfo: Record<string, { label: string; color: string }> = {
    in: { label: 'Entrada', color: 'bg-green-100 text-green-700' },
    out: { label: 'Saída', color: 'bg-red-100 text-red-700' },
    fiado: { label: 'Fiado', color: 'bg-yellow-100 text-yellow-700' },
    devolucao: { label: 'Devolução', color: 'bg-blue-100 text-blue-700' },
  };

  // Atualiza valor automaticamente para fiado
  useEffect(()=>{
    if(form.type==='fiado' && form.product_id && form.quantity){
      const prod = productsMap[form.product_id];
      if(prod){
        const total = parseFloat(form.quantity) * prod.price;
        if(!isNaN(total)) setForm(prev=>({...prev, amount: total.toFixed(2)}));
      }
    }
  },[form.type, form.product_id, form.quantity, productsMap]);

  // Carrega movimentações
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['inventory_movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  // Mutação para criar ajuste manual
  const movementMutation = useMutation({
    mutationFn: async () => {
      if (!form.product_id || !form.quantity) throw new Error('Preencha produto e quantidade');
      if(form.type==='fiado'){
        if(!form.customer_id||!form.amount||!form.due_date) throw new Error('Preencha cliente, valor e vencimento');
      }
      if(form.type==='devolucao'){
        if(!form.sale_id) throw new Error('Selecione a venda de origem');
      }
      const qty = parseInt(form.quantity);
      if (qty <= 0) throw new Error('Quantidade deve ser positiva');
      const { error } = await supabase.from('inventory_movements').insert({
        type: form.type,
        product_id: form.product_id,
        quantity: qty,
         customer_id: form.customer_id || null,
         amount: form.amount? parseFloat(form.amount): null,
         due_date: form.due_date || null,
         sale_id: form.sale_id || null,
        reason: form.reason || null,
        user_id: user?.id || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
      // Invalida feed de atividades recentes (todas e do cliente específico)
      queryClient.invalidateQueries({ queryKey: ['customer-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['customer-interactions', ''] });
      if (form.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customer-interactions', form.customer_id] });
      }
      setIsDialogOpen(false);
      setForm({ type: 'out', product_id: '', quantity: '', reason: '', customer_id:'', amount:'', due_date:'', sale_id:'' });
      toast({ title: 'Movimentação registrada!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações de Estoque</CardTitle>
          {userRole === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Saída</SelectItem>
                        <SelectItem value="fiado">Fiado</SelectItem>
                        <SelectItem value="devolucao">Devolução</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Produto</label>
                    <Select value={form.product_id} onValueChange={(value) => setForm({ ...form, product_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="qty" className="block text-sm font-medium mb-1">Quantidade</label>
                    <Input id="qty" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  {/* Seleção de cliente (opcional, obrigatório para fiado) */}
                   <div>
                     <label className="block text-sm font-medium mb-1">Cliente (opcional)</label>
                     <Select value={form.customer_id} onValueChange={(value) => setForm({ ...form, customer_id: value })}>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione" />
                       </SelectTrigger>
                       <SelectContent className="max-h-60 overflow-y-auto">
                         {customers.map((c) => (
                           <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   {/* Campos extras para Fiado */}
                   {form.type === 'fiado' && (
                     <>
                       <div>
                         <label className="block text-sm font-medium mb-1">Cliente</label>
                         <Select value={form.customer_id} onValueChange={(value) => setForm({...form, customer_id:value})}>
                           <SelectTrigger>
                             <SelectValue placeholder="Selecione" />
                           </SelectTrigger>
                           <SelectContent className="max-h-60 overflow-y-auto">
                             {customers.map(c=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                           </SelectContent>
                         </Select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                           <Input type="number" step="0.01" value={form.amount} readOnly />
                         </div>
                         <div>
                           <label className="block text-sm font-medium mb-1">Vencimento</label>
                           <Input type="date" value={form.due_date} onChange={(e)=>setForm({...form, due_date:e.target.value})} />
                         </div>
                       </div>
                     </>
                   )}
                   {/* Campos extras para Devolução */}
                   {form.type==='devolucao' && (
                     <div>
                       <label className="block text-sm font-medium mb-1">Venda Original</label>
                       <Select value={form.sale_id} onValueChange={(value)=>setForm({...form, sale_id:value})}>
                         <SelectTrigger>
                           <SelectValue placeholder="Selecione" />
                         </SelectTrigger>
                         <SelectContent className="max-h-60 overflow-y-auto">
                           {salesList.map(s=>(<SelectItem key={s.id} value={s.id}>{new Date(s.created_at).toLocaleDateString()} - {s.id.slice(0,6)}</SelectItem>))}
                         </SelectContent>
                       </Select>
                     </div>
                   )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo</label>
                    <Input id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                  </div>
                  <Button onClick={() => movementMutation.mutate()} className="w-full">Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Quantidade</th>
                    <th className="text-left p-2">Motivo</th>
                    <th className="text-left p-2">Cliente</th>
                     <th className="text-left p-2">Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m: any) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(m.date).toLocaleString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${typeInfo[m.type]?.color || 'bg-gray-100 text-gray-700'}`}>{typeInfo[m.type]?.label || m.type}</span>
                      </td>
                      <td className="p-2">{productsMap[m.product_id]?.name ?? m.product_id}</td>
                      <td className="p-2">{m.quantity}</td>
                      <td className="p-2">{m.reason ?? '-'}</td>
                      <td className="p-2">{ customers.find(c=>c.id===m.customer_id)?.name ?? '-' }</td>
                       <td className="p-2">{usersMap[m.user_id] ?? m.user_id }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Movements;
