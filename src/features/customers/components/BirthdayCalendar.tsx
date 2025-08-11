import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Calendar, Gift, ChevronLeft, ChevronRight, Cake, Phone, Mail } from 'lucide-react';
import { useCustomers } from '@/features/customers/hooks/use-crm';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { cn } from '@/core/config/utils';
import { N8NPlaceholder } from './N8NPlaceholder';

interface BirthdayCalendarProps {
  className?: string;
  showActions?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  segment?: string;
}

interface BirthdayCustomer extends Customer {
  birthdayThisYear: Date;
  daysUntil: number;
  isToday: boolean;
  isPassed: boolean;
}

export const BirthdayCalendar = ({ className, showActions = true }: BirthdayCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedCustomer, setSelectedCustomer] = useState<BirthdayCustomer | null>(null);

  const { data: customers = [], isLoading } = useCustomers();

  // Processar clientes com aniversários
  const birthdayCustomers = useMemo((): BirthdayCustomer[] => {
    const today = new Date();
    const currentYear = today.getFullYear();

    return customers
      .filter(customer => customer.birthday)
      .map(customer => {
        const birthday = new Date(customer.birthday!);
        const birthdayThisYear = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        
        // Se já passou este ano, considerar próximo ano
        let nextBirthday = birthdayThisYear;
        if (birthdayThisYear < today) {
          nextBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
        }

        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isToday = daysUntil === 0;
        const isPassed = birthdayThisYear < today;

        return {
          ...customer,
          birthdayThisYear,
          daysUntil: isPassed ? 365 + daysUntil : daysUntil,
          isToday,
          isPassed
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [customers]);

  // Filtrar por mês selecionado
  const monthBirthdays = useMemo(() => {
    return birthdayCustomers.filter(customer => {
      const birthday = new Date(customer.birthday!);
      return birthday.getMonth() === currentMonth;
    });
  }, [birthdayCustomers, currentMonth]);

  // Aniversários do mês atual
  const thisMonthBirthdays = useMemo(() => {
    const currentDate = new Date();
    return birthdayCustomers.filter(customer => {
      const birthday = new Date(customer.birthday!);
      return birthday.getMonth() === currentDate.getMonth();
    });
  }, [birthdayCustomers]);

  // Próximos aniversários (próximos 30 dias)
  const upcomingBirthdays = useMemo(() => {
    return birthdayCustomers
      .filter(customer => customer.daysUntil <= 30)
      .slice(0, 10);
  }, [birthdayCustomers]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const getBirthdayIcon = (customer: BirthdayCustomer) => {
    if (customer.isToday) return <Cake className="h-4 w-4 text-yellow-400 animate-bounce" />;
    if (customer.daysUntil <= 7) return <Gift className="h-4 w-4 text-orange-400" />;
    return <Calendar className="h-4 w-4 text-blue-400" />;
  };

  const getBirthdayColor = (customer: BirthdayCustomer) => {
    if (customer.isToday) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100';
    if (customer.daysUntil <= 7) return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
    if (customer.daysUntil <= 30) return 'bg-blue-500/20 border-blue-500/50 text-blue-100';
    return 'bg-gray-500/20 border-gray-500/50 text-gray-100';
  };

  const formatDaysUntil = (customer: BirthdayCustomer) => {
    if (customer.isToday) return 'HOJE! 🎉';
    if (customer.daysUntil === 1) return 'Amanhã 🎂';
    if (customer.daysUntil <= 7) return `${customer.daysUntil} dias 🎈`;
    if (customer.daysUntil <= 30) return `${customer.daysUntil} dias`;
    return `${Math.floor(customer.daysUntil / 30)} meses`;
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando aniversários..." />;
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Próximos Aniversários */}
      <Card className="lg:col-span-2 bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-primary-yellow" />
            Próximos Aniversários
            <Badge variant="outline" className="ml-auto">
              {upcomingBirthdays.length} próximos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBirthdays.length > 0 ? (
            upcomingBirthdays.map(customer => (
              <div
                key={customer.id}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02]",
                  getBirthdayColor(customer),
                  selectedCustomer?.id === customer.id && "ring-2 ring-primary-yellow/50"
                )}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getBirthdayIcon(customer)}
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs opacity-80">
                        {new Date(customer.birthday!).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-current">
                      {formatDaysUntil(customer)}
                    </Badge>
                    {customer.segment && (
                      <p className="text-xs mt-1 opacity-75">{customer.segment}</p>
                    )}
                  </div>
                </div>

                {/* Contato rápido */}
                {(customer.phone || customer.email) && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-current/20">
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{customer.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum aniversário nos próximos 30 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegação por Mês */}
      <div className="space-y-6">
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-sm text-white">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {monthBirthdays.length > 0 ? (
              monthBirthdays.map(customer => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-2 bg-gray-700/30 rounded border border-gray-600/30"
                >
                  <span className="text-sm text-gray-200">{customer.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(customer.birthday!).getDate()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                Sem aniversários neste mês
              </p>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardHeader>
            <CardTitle className="text-sm text-white">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total com aniversário:</span>
              <span className="text-white font-medium">{birthdayCustomers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Este mês:</span>
              <span className="text-white font-medium">{thisMonthBirthdays.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Próximos 30 dias:</span>
              <span className="text-yellow-400 font-medium">
                {birthdayCustomers.filter(c => c.daysUntil <= 30).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Hoje:</span>
              <span className="text-yellow-400 font-medium">
                {birthdayCustomers.filter(c => c.isToday).length} 🎉
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Automação de Campanhas */}
        {showActions && (
          <N8NPlaceholder
            automationType="birthday"
            className="h-auto"
          />
        )}
      </div>
    </div>
  );
};