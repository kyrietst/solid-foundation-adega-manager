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
  PieChart,
  Bot,
  Building,
  Receipt,
  Lock,
  History,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/core/config/utils";
import { useAuth } from "@/app/providers/AuthContext";
import { usePermissions } from "@/shared/hooks/auth/usePermissions";
import { getSFProTextClasses } from "@/core/config/theme-utils";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Usar hook de permissões centralizado
  const permissions = usePermissions();

  // Definir todos os links do sistema (Modo de Acesso Focado)
  // Admin vê tudo habilitado, outras roles veem tudo mas com restrições visuais
  const allLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "dashboard",
      icon: (
        <BarChart3 className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewDashboard,
    },
    {
      id: "sales",
      label: "Vendas",
      href: "sales",
      icon: (
        <ShoppingCart className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewSales,
    },
    {
      id: "inventory",
      label: "Estoque",
      href: "inventory",
      icon: (
        <Package className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewProducts,
    },
    {
      id: "customers",
      label: "Clientes",
      href: "customers",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewCustomers,
    },
    {
      id: "crm",
      label: "CRM Dashboard",
      href: "crm",
      icon: (
        <PieChart className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewCustomerInsights,
    },
    {
      id: "delivery",
      label: "Entregas",
      href: "delivery",
      icon: (
        <Truck className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewDeliveries,
    },
    {
      id: "suppliers",
      label: "Fornecedores",
      href: "suppliers",
      icon: (
        <Building className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canAccessAdmin, // Apenas admin por enquanto
    },
    {
      id: "movements",
      label: "Movimentações",
      href: "movements",
      icon: (
        <RefreshCw className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewMovements,
    },
    {
      id: "reports",
      label: "Relatórios",
      href: "reports",
      icon: (
        <LineChart className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canAccessReports,
    },
    {
      id: "expenses",
      label: "Despesas",
      href: "expenses",
      icon: (
        <Receipt className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canAccessAdmin, // Apenas admin por enquanto
    },
    {
      id: "marketing",
      label: "Marketing",
      href: "marketing",
      icon: (
        <LineChart className="h-5 w-5 shrink-0 text-purple-400" />
      ),
      isEnabled: permissions.canAccessAdmin, // Apenas admin
    },
    {
      id: "activities",
      label: "Logs do Sistema",
      href: "activities",
      icon: (
        <History className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canAccessAdmin, // Apenas admin
    },
    {
      id: "users",
      label: "Usuários",
      href: "users",
      icon: (
        <Settings className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      isEnabled: permissions.canViewUsers,
    },
  ];

  // Transformar links em formato adequado para o SidebarLink
  const links = allLinks.map(link => ({
    label: link.label,
    href: link.href,
    icon: link.isEnabled ? link.icon : (
      // Aplicar estilo cinza quando desabilitado
      React.cloneElement(link.icon as any, {
        className: "h-5 w-5 shrink-0 text-gray-500"
      })
    ),
    disabled: !link.isEnabled,
  }));

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
            <nav className="flex flex-col gap-1" aria-label="Navegação principal">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={{
                    label: link.label,
                    href: link.href,
                    icon: link.icon,
                  }}
                  disabled={link.disabled}
                  onClick={(e) => handleLinkClick(link.href, e)}
                  className={cn(
                    location.pathname === `/${link.href}` && !link.disabled
                      ? "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                      : !link.disabled && "hover:bg-white/10"
                  )}
                />
              ))}
            </nav>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-2">
            {/* User Info */}
            <SidebarLink
              link={{
                label: user?.email || "Usuário",
                href: "#",
                icon: (
                  <div className="h-5 w-5 shrink-0 rounded-md bg-gradient-to-r from-primary-yellow to-accent-gold-90 flex items-center justify-center text-black-100 text-xs /* arbitrary-allowed: icon sizing */ font-bold shadow-lg">
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