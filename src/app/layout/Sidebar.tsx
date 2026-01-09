"use client";
import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/shared/ui/layout/sidebar";
import {
  BarChart3,
  ShoppingCart,
  Package,
  RefreshCw,
  Users,
  Truck,
  Settings,
  LogOut,
  LineChart,
  Building,
  Receipt,
  History,
  ChevronRight,
  Store,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/core/config/utils";
import { useAuth } from "@/app/providers/AuthContext";
import { usePermissions } from "@/shared/hooks/auth/usePermissions";
import { getSFProTextClasses } from "@/core/config/theme-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/primitives/collapsible";

// Internal Component for Collapsible Logic
const CollapsibleGroup = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white group cursor-pointer transition-colors">
        {title}
        <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-90")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Usar hook de permissões centralizado
  const permissions = usePermissions();

  // Grupos de Navegação (Agrupamento Lógico)
  const navigationGroups = [
    {
      title: "Frente de Loja",
      items: [
        {
          id: "sales",
          label: "Vendas",
          href: "sales",
          icon: <ShoppingCart className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canViewSales,
        },
        {
          id: "delivery",
          label: "Delivery", // Renomeado de Entregas para Delivery (padrão de mercado)
          href: "delivery",
          icon: <Truck className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canViewDeliveries,
        },
        {
          id: "customers",
          label: "Clientes",
          href: "customers",
          icon: <Users className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canViewCustomers,
        },
      ]
    },
    {
      title: "Estoque & Compras",
      items: [
        {
          id: "inventory",
          label: "Produtos", // Renomeado de Estoque para Produtos
          href: "inventory",
          icon: <Package className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canViewProducts,
        },
        {
          id: "movements",
          label: "Movimentações",
          href: "movements",
          icon: <RefreshCw className="h-5 w-5 shrink-0 text-primary-yellow" />, // TODO: Change to ArrowLeftRight if available
          isEnabled: permissions.canViewMovements,
        },
        {
          id: "suppliers",
          label: "Fornecedores",
          href: "suppliers",
          icon: <Building className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canAccessAdmin,
        }
      ]
    },
    {
      title: "Gestão",
      items: [
        {
          id: "expenses",
          label: "Despesas",
          href: "expenses",
          icon: <Receipt className="h-5 w-5 shrink-0 text-primary-yellow" />, // TODO: Change to Wallet
          isEnabled: permissions.canAccessAdmin,
        },
        {
          id: "reports",
          label: "Relatórios",
          href: "reports",
          icon: <BarChart3 className="h-5 w-5 shrink-0 text-primary-yellow" />, // Changed to BarChart3
          isEnabled: permissions.canAccessReports,
        },
        {
          id: "marketing",
          label: "Marketing",
          href: "marketing",
          icon: <LineChart className="h-5 w-5 shrink-0 text-purple-400" />, // TODO: Change to Megaphone
          isEnabled: permissions.canAccessAdmin,
        },
        // CRM Removido daqui conforme simplificação, acessado via Clientes ou Dashboard específico se necessário
      ]
    },
    {
      title: "Sistema",
      items: [
        {
          id: "users",
          label: "Equipe", // Renomeado de Usuários
          href: "users",
          icon: <Settings className="h-5 w-5 shrink-0 text-primary-yellow" />, // TODO: Change to UserCog
          isEnabled: permissions.canViewUsers,
        },
        {
          id: "activities",
          label: "Logs do Sistema",
          href: "activities",
          icon: <History className="h-5 w-5 shrink-0 text-primary-yellow" />,
          isEnabled: permissions.canAccessAdmin,
        }
      ]
    }
  ];

  const handleLinkClick = useCallback((href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    navigate(`/${href}`);
  }, [navigate]);

  const handleLogout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  return (
    <div className="h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="mb-6 px-1">
              {open ? (
                <Logo onClick={() => setOpen(!open)} />
              ) : (
                <LogoIcon onClick={() => setOpen(!open)} />
              )}
            </div>
            
            <nav className="flex flex-col gap-6" aria-label="Navegação principal">
              {/* Dashboard Item - Fixo no topo */}
               {permissions.canViewDashboard && (
                  <SidebarLink
                    link={{
                      label: "Dashboard",
                      href: "dashboard",
                      icon: <BarChart3 className="h-5 w-5 shrink-0 text-[#f9cb15]" />,
                    }}
                    onClick={(e: any) => handleLinkClick("dashboard", e)}
                    className={cn(
                      location.pathname === "/dashboard"
                        ? "bg-[#f9cb15]/10 text-[#f9cb15] border border-[#f9cb15]/20 shadow-[0_0_10px_rgba(249,203,21,0.1)]"
                        : "hover:bg-[#f9cb15]/5 text-zinc-400 hover:text-[#f9cb15] transition-colors"
                    )}
                  />
              )}

              {/* Grupos de Navegação */}
              <div className="flex flex-col gap-2">
                {navigationGroups.map((group, groupIdx) => {
                  // Lógica: Se a sidebar estiver fechada (!open), renderizamos apenas os ícones (flat list)
                  // Se estiver aberta, renderizamos o Accordion (Collapsible)
                  if (!open) {
                     return (
                      <div key={groupIdx} className="flex flex-col gap-1">
                        {/* Separator visual opcional quando fechado */}
                        <div className="h-px bg-white/5 mx-2 my-1" />
                        {group.items.map((link) => {
                          const isDisabled = !link.isEnabled;
                          return (
                            <SidebarLink
                              key={link.id}
                              link={{
                                label: link.label,
                                href: link.href,
                                icon: isDisabled ? (
                                  React.cloneElement(link.icon as any, {className: "h-5 w-5 shrink-0 text-gray-500"})
                                ) : link.icon,
                              }}
                              disabled={isDisabled}
                              onClick={(e: any) => handleLinkClick(link.href, e)}
                              className={cn(
                                location.pathname === `/${link.href}` && !isDisabled
                                  ? "bg-[#f9cb15]/10 text-[#f9cb15] border border-[#f9cb15]/20 shadow-[0_0_10px_rgba(249,203,21,0.1)]"
                                  : !isDisabled && "hover:bg-[#f9cb15]/5 text-zinc-400 hover:text-[#f9cb15] transition-colors"
                              )}
                            />
                          );
                        })}
                      </div>
                     );
                  }

                  // Sidebar ABERTA: Usar Collapsible
                  return (
                    <CollapsibleGroup 
                      key={groupIdx} 
                      title={group.title} 
                      defaultOpen={groupIdx === 0} // Primeiro grupo aberto por default
                    >
                      {group.items.map((link) => {
                        const isDisabled = !link.isEnabled;
                        return (
                          <SidebarLink
                            key={link.id}
                            link={{
                              label: link.label,
                              href: link.href,
                              icon: isDisabled ? (
                                React.cloneElement(link.icon as any, {className: "h-5 w-5 shrink-0 text-gray-500"})
                              ) : link.icon,
                            }}
                            disabled={isDisabled}
                            onClick={(e: any) => handleLinkClick(link.href, e)}
                            className={cn(
                              "pl-2 border-l border-white/5 ml-1", // Indentação visual hierárquica
                              location.pathname === `/${link.href}` && !isDisabled
                                ? "text-[#f9cb15] font-medium drop-shadow-[0_0_8px_rgba(249,203,21,0.5)]"
                                : !isDisabled && "hover:bg-[#f9cb15]/5 hover:text-[#f9cb15] text-gray-400 transition-colors"
                            )}
                          />
                        );
                      })}
                    </CollapsibleGroup>
                  );
                })}
              </div>
            </nav>
          </div>
          
          <div className="mt-auto border-t border-white/5 p-4 bg-black/20 backdrop-blur-md mx-[-12px] mb-[-16px]">
            {open ? (
              <div className="flex items-center gap-3 p-2 rounded-xl transition-colors duration-200 hover:bg-white/5 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-[#f9cb15]/50 transition-colors">
                     {/* Fallback Avatar */}
                     <span className="text-xs font-bold text-[#f9cb15]">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#18181b] rounded-full"></div>
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-200 truncate group-hover:text-white">{user?.email || 'Admin'}</p>
                  <p className="text-xs text-zinc-500 truncate">Gerente</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Sair do Sistema"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                 <div className="relative group cursor-pointer" title={user?.email || 'Admin'}>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-[#f9cb15]/50 transition-colors">
                       <span className="text-xs font-bold text-[#f9cb15]">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#18181b] rounded-full"></div>
                 </div>
                 <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Sair do Sistema"
                 >
                   <LogOut size={18} />
                 </button>
              </div>
            )}
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="px-6 py-8 border-b border-white/5 flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-1">
        <div 
          onClick={onClick}
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#f9cb15]/10 border border-[#f9cb15]/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] cursor-pointer hover:bg-[#f9cb15]/20 transition-colors"
        >
          <Store className="text-[#f9cb15]" size={20} />
        </div>
        <h1 className="text-white text-lg font-semibold tracking-tight">Adega Anita's</h1>
      </div>
      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] pl-[3.25rem] font-bold">Sistema de Gerenciamento</p>
    </div>
  );
};

export const LogoIcon = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="relative z-20 flex items-center justify-center py-2">
      <div 
        onClick={onClick}
        className="relative flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#f9cb15]/10 border border-[#f9cb15]/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] cursor-pointer hover:bg-[#f9cb15]/20 transition-colors"
      >
        <Store className="text-[#f9cb15]" size={20} />
      </div>
    </div>
  );
};