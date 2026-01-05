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
                      icon: <BarChart3 className="h-5 w-5 shrink-0 text-primary-yellow" />,
                    }}
                    onClick={(e: any) => handleLinkClick("dashboard", e)}
                    className={cn(
                      location.pathname === "/dashboard"
                        ? "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                        : "hover:bg-white/10"
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
                                  ? "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                                  : !isDisabled && "hover:bg-white/10"
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
                                ? "text-primary-yellow font-medium"
                                : !isDisabled && "hover:bg-white/5 hover:text-white text-gray-400"
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
          
          <div className="border-t border-white/10 pt-3 space-y-2">
            {/* User Info */}
            <SidebarLink
              link={{
                label: user?.email || "Usuário",
                href: "#",
                icon: (
                  <div className="h-5 w-5 shrink-0 rounded-md bg-gradient-to-r from-primary-yellow to-accent-gold-90 flex items-center justify-center text-black-100 text-xs font-bold shadow-lg">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                ),
              }}
              className="hover:bg-white/10"
            />
            {/* Logout */}
            <SidebarLink
              link={{
                label: "Sair",
                href: "#",
                icon: (
                  <LogOut className="h-5 w-5 shrink-0 text-accent-red" />
                ),
              }}
              onClick={handleLogout}
              className="hover:bg-accent-red/20 hover:text-accent-red"
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="relative z-20 flex items-center space-x-3 py-2">
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-accent-gold-90 shadow-lg cursor-pointer hover:shadow-yellow-400/20"
      />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col"
      >
        <span className={cn(getSFProTextClasses('h3', 'neutral'), "text-white leading-tight")}>
          Adega Anita's
        </span>
        <span className={cn(getSFProTextClasses('caption', 'primary'), "text-primary-yellow")}>
          SISTEMA DE GERENCIAMENTO
        </span>
      </motion.div>
    </div>
  );
};

export const LogoIcon = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="relative z-20 flex items-center justify-center py-2">
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-accent-gold-90 shadow-lg cursor-pointer hover:shadow-yellow-400/20"
      />
    </div>
  );
};