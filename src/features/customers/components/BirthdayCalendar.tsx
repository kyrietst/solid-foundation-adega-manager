import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Calendar, Gift, ChevronLeft, ChevronRight, Cake, Phone, Mail, Sparkles } from 'lucide-react';
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

    const processed = customers
      .filter(customer => !!customer.birthday)
      .map(customer => {
        const birthday = new Date(customer.birthday!);
        
        // Aniversário deste ano
        const birthdayThisYear = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        
        // Resetar horas para comparação precisa
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const birthdayThisYearMidnight = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        
        // Se já passou este ano, considerar próximo ano
        let nextBirthday = birthdayThisYearMidnight;
        if (birthdayThisYearMidnight < todayMidnight) {
          nextBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
        }

        const timeDiff = nextBirthday.getTime() - todayMidnight.getTime();
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const isToday = daysUntil === 0;
        const isPassed = birthdayThisYearMidnight < todayMidnight;
        
        // Debug removido - cálculo de aniversário corrigido

        return {
          ...customer,
          birthdayThisYear: birthdayThisYearMidnight,
          daysUntil,
          isToday,
          isPassed
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
      
    return processed;
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
      .filter(customer => customer.daysUntil <= 30 && customer.daysUntil >= 0)
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
    if (customer.isToday) return (
      <div className="relative">
        <Cake className="h-5 w-5 text-yellow-400 animate-bounce drop-shadow-lg" />
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping"></div>
      </div>
    );
    if (customer.daysUntil === 1) return (
      <Gift className="h-5 w-5 text-orange-400 drop-shadow-md" />
    );
    if (customer.daysUntil <= 7) return (
      <Gift className="h-4 w-4 text-purple-400 drop-shadow-sm hover:scale-110 transition-transform" />
    );
    return <Calendar className="h-4 w-4 text-blue-400 drop-shadow-sm" />;
  };

  const getBirthdayColor = (customer: BirthdayCustomer) => {
    if (customer.isToday) return 'bg-gradient-to-r from-yellow-500/30 via-orange-500/25 to-yellow-500/30 border-yellow-400/60 text-yellow-100 shadow-lg shadow-yellow-500/20';
    if (customer.daysUntil <= 7) return 'bg-gradient-to-r from-orange-500/25 via-red-500/20 to-orange-500/25 border-orange-400/50 text-orange-100 shadow-md shadow-orange-500/15';
    if (customer.daysUntil <= 30) return 'bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-500/20 border-blue-400/40 text-blue-100 shadow-md shadow-blue-500/10';
    return 'bg-gradient-to-r from-gray-500/15 via-slate-500/10 to-gray-500/15 border-gray-400/30 text-gray-100';
  };

  const formatDaysUntil = (customer: BirthdayCustomer) => {
    if (customer.isToday) return 'HOJE! 🎉✨';
    if (customer.daysUntil === 1) return 'Amanhã 🎂🎈';
    if (customer.daysUntil <= 3) return `${customer.daysUntil} dias 🎈🎊`;
    if (customer.daysUntil <= 7) return `${customer.daysUntil} dias 🎈🎁`;
    if (customer.daysUntil <= 15) return `${customer.daysUntil} dias 🎈`;
    if (customer.daysUntil <= 30) return `${customer.daysUntil} dias 🗓️`;
    return `${Math.floor(customer.daysUntil / 30)} meses 📅`;
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
            <Badge 
              variant="outline" 
              className={cn(
                "ml-auto font-bold text-sm px-3 py-1.5 transition-all duration-500 backdrop-blur-sm",
                upcomingBirthdays.length === 0 && "bg-gray-500/20 border-gray-400/40 text-gray-300",
                upcomingBirthdays.length > 0 && upcomingBirthdays.length <= 2 && "bg-gradient-to-r from-blue-500/25 to-cyan-500/20 border-blue-400/60 text-blue-200 shadow-md shadow-blue-400/20",
                upcomingBirthdays.length > 2 && upcomingBirthdays.length <= 5 && "bg-gradient-to-r from-purple-500/25 to-pink-500/20 border-purple-400/60 text-purple-200 shadow-md shadow-purple-400/20",
                upcomingBirthdays.length > 5 && "bg-gradient-to-r from-yellow-500/30 to-orange-500/25 border-yellow-400/70 text-yellow-200 shadow-lg shadow-yellow-400/30 animate-bounce",
                "hover:scale-110 hover:shadow-xl hover:backdrop-blur-md"
              )}
            >
              <span className="flex items-center gap-1">
                {upcomingBirthdays.length > 5 && "🎉 "}
                {upcomingBirthdays.length > 2 && upcomingBirthdays.length <= 5 && "🎈 "}
                {upcomingBirthdays.length > 0 && upcomingBirthdays.length <= 2 && "📅 "}
                {upcomingBirthdays.length === 0 && "😴 "}
                <span className="font-mono">
                  {upcomingBirthdays.length}
                </span>
                {upcomingBirthdays.length === 1 ? " próximo" : " próximos"}
                {upcomingBirthdays.length > 3 && " ✨"}
              </span>
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
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCustomer(customer)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCustomer(customer);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getBirthdayIcon(customer)}
                      {customer.isToday && (
                        <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-yellow-300 animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium",
                        customer.isToday && "text-yellow-200 font-bold"
                      )}>
                        {customer.name}
                        {customer.isToday && " 🎊"}
                      </p>
                      <p className="text-xs opacity-80">
                        {new Date(customer.birthday!).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "border-current font-bold text-sm px-3 py-1.5 transition-all duration-300",
                        customer.isToday && "animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/70 shadow-lg shadow-yellow-400/30 scale-105",
                        customer.daysUntil === 1 && "bg-gradient-to-r from-orange-400/15 to-red-400/15 border-orange-400/60 shadow-md shadow-orange-400/20",
                        customer.daysUntil <= 7 && customer.daysUntil > 1 && "bg-gradient-to-r from-purple-400/10 to-pink-400/10 border-purple-400/50 shadow-md shadow-purple-400/15",
                        customer.daysUntil > 7 && "bg-gradient-to-r from-blue-400/10 to-cyan-400/10 border-blue-400/40 shadow-sm shadow-blue-400/10",
                        "hover:scale-110 hover:shadow-lg backdrop-blur-sm"
                      )}
                    >
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
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Total com aniversário:</span>
              <Badge 
                variant="outline" 
                className="bg-gray-600/20 border-gray-500/40 text-gray-200 font-mono font-bold px-2 py-1"
              >
                {birthdayCustomers.length}
              </Badge>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Este mês:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-mono font-bold px-2 py-1 transition-all duration-300",
                  thisMonthBirthdays.length === 0 && "bg-gray-600/20 border-gray-500/40 text-gray-300",
                  thisMonthBirthdays.length > 0 && "bg-blue-500/20 border-blue-400/50 text-blue-200 shadow-sm shadow-blue-400/10"
                )}
              >
                {thisMonthBirthdays.length}
              </Badge>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Próximos 30 dias:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-mono font-bold px-2 py-1 transition-all duration-300",
                  birthdayCustomers.filter(c => c.daysUntil <= 30).length === 0 && "bg-gray-600/20 border-gray-500/40 text-gray-300",
                  birthdayCustomers.filter(c => c.daysUntil <= 30).length > 0 && birthdayCustomers.filter(c => c.daysUntil <= 30).length <= 3 && "bg-purple-500/20 border-purple-400/50 text-purple-200 shadow-sm shadow-purple-400/10",
                  birthdayCustomers.filter(c => c.daysUntil <= 30).length > 3 && "bg-yellow-500/25 border-yellow-400/60 text-yellow-200 shadow-md shadow-yellow-400/15"
                )}
              >
                <span className="flex items-center gap-1">
                  {birthdayCustomers.filter(c => c.daysUntil <= 30).length > 3 && "🎈 "}
                  {birthdayCustomers.filter(c => c.daysUntil <= 30).length}
                </span>
              </Badge>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Hoje:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-mono font-bold px-2 py-1 transition-all duration-300",
                  birthdayCustomers.filter(c => c.isToday).length === 0 && "bg-gray-600/20 border-gray-500/40 text-gray-300",
                  birthdayCustomers.filter(c => c.isToday).length > 0 && "bg-gradient-to-r from-yellow-500/30 to-orange-500/25 border-yellow-400/70 text-yellow-200 shadow-lg shadow-yellow-400/30 animate-bounce"
                )}
              >
                <span className="flex items-center gap-1">
                  {birthdayCustomers.filter(c => c.isToday).length > 0 && "🎉 "}
                  {birthdayCustomers.filter(c => c.isToday).length}
                  {birthdayCustomers.filter(c => c.isToday).length > 0 && " ✨"}
                </span>
              </Badge>
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