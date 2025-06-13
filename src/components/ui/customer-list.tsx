import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CustomerProfile, useUpsertCustomer } from '@/hooks/use-crm';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, Search } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

interface CustomerListProps {
  customers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
}

export function CustomerList({ customers, onSelectCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof CustomerProfile>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerProfile>>({
    name: '',
    phone: '',
    email: '',
    contact_permission: false,
    segment: 'Novo',
    lifetime_value: 0
  });
  
  const upsertCustomer = useUpsertCustomer();

  const handleSort = (field: keyof CustomerProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower))
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === null) return sortDirection === 'asc' ? 1 : -1;
    if (fieldB === null) return sortDirection === 'asc' ? -1 : 1;
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    
    return 0;
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    
    await upsertCustomer.mutateAsync(newCustomer);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      contact_permission: false,
      segment: 'Novo',
      lifetime_value: 0
    });
    setIsNewCustomerDialogOpen(false);
  };

  const segmentColors = {
    'Primeira Compra': { bg: '#FCE7F3', text: '#831843' },
    'Recente': { bg: '#DCFCE7', text: '#14532D' },
    'Fiel - Prata': { bg: '#DBEAFE', text: '#1E40AF' },
    'Fiel - Ouro': { bg: '#FEF9C3', text: '#713F12' },
    'Fiel - VIP': { bg: '#F3E8FF', text: '#5B21B6' },
    'Em Risco': { bg: '#FFEDD5', text: '#9A3412' },
    'Inativo': { bg: '#FEE2E2', text: '#991B1B' },
    'Regular': { bg: '#E0F2FE', text: '#0C4A6E' },
    'Novo': { bg: '#DCFCE7', text: '#14532D' },
    'VIP': { bg: '#F3E8FF', text: '#5B21B6' },
    'default': { bg: '#F3F4F6', text: '#374151' }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsNewCustomerDialogOpen(true)}>
          Novo Cliente
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nome
                  {sortField === 'name' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('phone')}
              >
                <div className="flex items-center">
                  Telefone
                  {sortField === 'phone' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {sortField === 'email' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('last_purchase_date')}
              >
                <div className="flex items-center">
                  Última Compra
                  {sortField === 'last_purchase_date' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('lifetime_value')}
              >
                <div className="flex items-center">
                  Valor Total
                  {sortField === 'lifetime_value' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('segment')}
              >
                <div className="flex items-center">
                  Segmento
                  {sortField === 'segment' && (
                    <ChevronDown 
                      className={cn(
                        "ml-1 h-4 w-4", 
                        sortDirection === 'desc' && "transform rotate-180"
                      )} 
                    />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>
                    {customer.last_purchase_date 
                      ? format(new Date(customer.last_purchase_date), 'dd/MM/yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.lifetime_value 
                      ? `R$ ${customer.lifetime_value.toFixed(2)}`
                      : 'R$ 0,00'
                    }
                  </TableCell>
                  <TableCell>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center"
                      style={{
                        backgroundColor: segmentColors[customer.segment as keyof typeof segmentColors]?.bg || segmentColors.default.bg,
                        color: segmentColors[customer.segment as keyof typeof segmentColors]?.text || segmentColors.default.text
                      }}
                    >
                      {customer.segment || 'Não definido'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {searchTerm 
                    ? 'Nenhum cliente encontrado para esta busca'
                    : 'Nenhum cliente cadastrado'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para adicionar novo cliente */}
      <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newCustomer.name || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newCustomer.phone || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="birthday">Data de Aniversário</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newCustomer.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newCustomer.birthday ? (
                      format(new Date(newCustomer.birthday), 'dd/MM/yyyy')
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newCustomer.birthday ? new Date(newCustomer.birthday) : undefined}
                    onSelect={(date) => setNewCustomer({
                      ...newCustomer,
                      birthday: date ? date.toISOString() : null
                    })}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact_preference">Preferência de Contato</Label>
              <Select
                value={newCustomer.contact_preference || ''}
                onValueChange={(value) => setNewCustomer({
                  ...newCustomer,
                  contact_preference: value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma preferência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="contact_permission"
                checked={newCustomer.contact_permission || false}
                onCheckedChange={(checked) => setNewCustomer({
                  ...newCustomer,
                  contact_permission: checked as boolean
                })}
              />
              <Label htmlFor="contact_permission">
                Permissão para contato
              </Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddCustomer} 
              disabled={!newCustomer.name || upsertCustomer.isPending}
            >
              {upsertCustomer.isPending ? 'Adicionando...' : 'Adicionar Cliente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}