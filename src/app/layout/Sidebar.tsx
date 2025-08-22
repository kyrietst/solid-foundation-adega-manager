"use client";
import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
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
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/core/config/utils";
import { useAuth } from "@/app/providers/AuthContext";
import { getSFProTextClasses } from "@/core/config/theme-utils";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

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
    },
    {
      id: "sales",
      label: "Vendas",
      href: "sales",
      icon: (
        <IconShoppingCart className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "inventory",
      label: "Estoque",
      href: "inventory",
      icon: (
        <IconPackage className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "suppliers",
      label: "Fornecedores",
      href: "suppliers",
      icon: (
        <IconBuilding className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "customers",
      label: "Clientes",
      href: "customers",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "crm",
      label: "CRM Dashboard",
      href: "crm",
      icon: (
        <IconChartPie className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "delivery",
      label: "Delivery",
      href: "delivery",
      icon: (
        <IconTruck className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee", "delivery"],
    },
    {
      id: "movements",
      label: "Movimentações",
      href: "movements",
      icon: (
        <IconRefresh className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
    },
    {
      id: "automations",
      label: "Automações",
      href: "automations",
      icon: (
        <IconRobot className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
    },
    {
      id: "reports",
      label: "Relatórios",
      href: "reports",
      icon: (
        <IconReportAnalytics className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin", "employee"],
    },
    {
      id: "users",
      label: "Usuários",
      href: "users",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-primary-yellow" />
      ),
      roles: ["admin"],
    },
  ];

  // Filtrar links baseado no sistema de permissões da documentação
  const getFilteredLinks = () => {
    if (!userRole) return [];

    // Admin principal (adm@adega.com) tem acesso a tudo
    if (user?.email === 'adm@adega.com') {
      return allLinks;
    }

    // Entregadores só veem delivery
    if (userRole === 'delivery') {
      return allLinks.filter(item => item.id === 'delivery');
    }

    // Outros usuários conforme roles permitidos
    return allLinks.filter(item => item.roles.includes(userRole));
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
                  <div className="h-5 w-5 shrink-0 rounded-md bg-gradient-to-r from-primary-yellow to-yellow-90 flex items-center justify-center text-black-100 text-[10px] font-bold shadow-lg">
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
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-yellow-90 shadow-lg" />
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
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-primary-yellow to-yellow-90 shadow-lg" />
    </div>
  );
};