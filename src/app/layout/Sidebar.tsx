"use client";
import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/shared/ui/layout/sidebar";
import {
  IconChartBar,
  IconShoppingCart,
  IconPackage,
  IconRefresh,
  IconUsers,
  IconTruck,
  IconSettings,
  IconLogout,
  IconReportAnalytics,
  IconChartPie,
  IconRobot,
  IconBuilding,
  IconReceipt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/core/config/utils";
import { useAuth } from "@/app/providers/AuthContext";
import { useFeatureFlag } from "@/shared/hooks/auth/useFeatureFlag";
import { getSFProTextClasses } from "@/core/config/theme-utils";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Obter todas as feature flags necessárias uma vez no topo do componente
  const isDashboardEnabled = useFeatureFlag('dashboard_enabled');
  const isSalesEnabled = useFeatureFlag('sales_enabled');
  const isInventoryEnabled = useFeatureFlag('inventory_enabled');
  const isSuppliersEnabled = useFeatureFlag('suppliers_enabled');
  const isCustomersEnabled = useFeatureFlag('customers_enabled');
  const isDeliveryEnabled = useFeatureFlag('delivery_enabled');
  const isMovementsEnabled = useFeatureFlag('movements_enabled');
  const isReportsEnabled = useFeatureFlag('reports_enabled');
  const isExpensesEnabled = useFeatureFlag('expenses_enabled');

  // Definir links baseado na documentação
  const allLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "dashboard",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "dashboard_enabled",
    },
    {
      id: "sales",
      label: "Vendas",
      href: "sales",
      icon: (
        <IconShoppingCart className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "sales_enabled",
    },
    {
      id: "inventory",
      label: "Estoque",
      href: "inventory",
      icon: (
        <IconPackage className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "inventory_enabled",
    },
    {
      id: "suppliers",
      label: "Fornecedores",
      href: "suppliers",
      icon: (
        <IconBuilding className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "suppliers_enabled",
    },
    {
      id: "customers",
      label: "Clientes",
      href: "customers",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "customers_enabled",
    },
    {
      id: "crm",
      label: "CRM Dashboard",
      href: "crm",
      icon: (
        <IconChartPie className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "customers_enabled", // CRM usa a mesma flag que clientes
    },
    {
      id: "delivery",
      label: "Delivery",
      href: "delivery",
      icon: (
        <IconTruck className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee", "delivery"],
      featureFlag: "delivery_enabled",
    },
    {
      id: "movements",
      label: "Movimentações",
      href: "movements",
      icon: (
        <IconRefresh className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
      featureFlag: "movements_enabled",
    },
    {
      id: "automations",
      label: "Automações",
      href: "automations",
      icon: (
        <IconRobot className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
      featureFlag: "movements_enabled", // Automações usa a mesma flag que movimentações
    },
    {
      id: "reports",
      label: "Relatórios",
      href: "reports",
      icon: (
        <IconReportAnalytics className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
      featureFlag: "reports_enabled",
    },
    {
      id: "expenses",
      label: "Despesas",
      href: "expenses",
      icon: (
        <IconReceipt className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
      featureFlag: "expenses_enabled",
    },
    {
      id: "users",
      label: "Usuários",
      href: "users",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
      featureFlag: null, // Usuários sempre disponível para admin (gestão de sistema)
    },
  ];

  // Filtrar links baseado no sistema de permissões + feature flags
  const getFilteredLinks = () => {
    if (!userRole) return [];

    // Admin principal (adm@adega.com) tem acesso a tudo (feature flags já são true no AuthContext)
    if (user?.email === 'adm@adega.com') {
      return allLinks;
    }

    // Primeiro filtrar por roles
    let linksFilteredByRole;
    if (userRole === 'delivery') {
      // Entregadores só veem delivery
      linksFilteredByRole = allLinks.filter(item => item.id === 'delivery');
    } else {
      // Outros usuários conforme roles permitidos
      linksFilteredByRole = allLinks.filter(item => item.roles.includes(userRole));
    }

    // Depois filtrar por feature flags usando as flags já obtidas
    return linksFilteredByRole.filter(link => {
      // Se não tem feature flag, sempre inclui (ex: usuários)
      if (!link.featureFlag) {
        return true;
      }

      // Verifica se a feature flag está ativa usando as variáveis já obtidas
      switch (link.featureFlag) {
        case 'dashboard_enabled':
          return isDashboardEnabled;
        case 'sales_enabled':
          return isSalesEnabled;
        case 'inventory_enabled':
          return isInventoryEnabled;
        case 'suppliers_enabled':
          return isSuppliersEnabled;
        case 'customers_enabled':
          return isCustomersEnabled;
        case 'delivery_enabled':
          return isDeliveryEnabled;
        case 'movements_enabled':
          return isMovementsEnabled;
        case 'reports_enabled':
          return isReportsEnabled;
        case 'expenses_enabled':
          return isExpensesEnabled;
        default:
          return false;
      }
    });
  };

  const filteredLinks = getFilteredLinks();

  // Converter para formato esperado pelo SidebarLink
  const links = filteredLinks.map(link => ({
    label: link.label,
    href: link.href,
    icon: link.icon,
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
              {open ? <Logo /> : <LogoIcon />}
            </div>
            <nav className="flex flex-col gap-1" aria-label="Navegação principal">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  onClick={(e) => handleLinkClick(link.href, e)}
                  className={cn(
                    location.pathname === `/${link.href}`
                      ? "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                      : "hover:bg-white/10"
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
                  <IconLogout className="h-5 w-5 shrink-0 text-accent-red" />
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

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-3 py-2">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-accent-gold-90 shadow-lg" />
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

export const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center justify-center py-2">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-accent-gold-90 shadow-lg" />
    </div>
  );
};